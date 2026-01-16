import argparse
import sys
import os
import time

# Patch sleep to make execution instant (no hardware delays needed for file generation)
time.sleep = lambda x: None

# Ensure we can import local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    from PIL import Image
except ImportError:
    print("Error: PIL (Pillow) library is required but not found.")
    sys.exit(1)

# Import existing protocol and font logic
try:
    from mono_protocol import MONOProtocol
    from lawo_font import LawoFont
except ImportError as e:
    print(f"Error importing helper modules: {e}")
    sys.exit(1)

class ExporterMONOProtocol(MONOProtocol):
    """
    A mock/bridge implementation of MONOProtocol that captures
    generated frames into a byte buffer instead of sending them to serial.
    """
    def __init__(self, debug=False):
        super().__init__(debug)
        self.packet_data = bytearray()

    def _send(self, frame):
        """
        Capture the frame (list of ints or bytearray) into our continuous buffer.
        """
        self.packet_data.extend(frame)

    def _receive(self):
        """
        Mock receive. Since we are only generating payloads, we don't expect
        responses or can pretend we received nothing/acknowledgement.
        """
        return None

def main():
    parser = argparse.ArgumentParser(description="Bridge script to generate LAWO/ALFA bus display payloads.")
    
    parser.add_argument("--text", required=True, help="The string to render.")
    parser.add_argument("--font", required=True, help="Path to the .FXX font file.")
    parser.add_argument("--width", type=int, required=True, help="Display width.")
    parser.add_argument("--height", type=int, required=True, help="Display height.")
    parser.add_argument("--type", choices=['led', 'flipdot'], required=True, help="Display type to determine protocol logic.")
    parser.add_argument("--out", required=True, help="The destination path for the .bin file.")

    args = parser.parse_args()

    # --- 1. Load Font & 2. Render Text ---
    if args.font.lower().endswith('.ttf'):
        # Mock Path: Use standard Pillow font rendering
        from PIL import ImageFont, ImageDraw
        # Load a system font (e.g., Arial) at the target height
        font = ImageFont.truetype(args.font, args.height)
        
        # Create a temporary image to render text
        text_width = font.getlength(args.text)
        text_img = Image.new('L', (int(text_width), args.height), 0)
        draw = ImageDraw.Draw(text_img)
        draw.text((0, 0), args.text, font=font, fill=255)
    else:
        # Production Path: Use LAWO parser
        font = LawoFont()
        font.read_file(args.font)
        text_img = font.render_text(args.text)

    # --- 3. Composite onto Canvas ---
    # Create a canvas of the target display size
    final_img = Image.new('L', (args.width, args.height), 0)
    
    # Position text: Centered vertically, Left aligned (x=0)
    # Note: If text is wider than display, it will be cropped by paste or extend beyond.
    # Standard PIL paste behavior: image is pasted at (0, y_offset).
    if text_img:
        y_offset = (args.height - text_img.height) // 2
        final_img.paste(text_img, (0, int(y_offset)))

    # --- 4. Initialize Protocol ---
    # Use our capturing subclass
    protocol = ExporterMONOProtocol(debug=False)
    
    # Set virtual display attributes (address 1 is arbitrary but required for internal checks)
    address = 1
    protocol.set_display_attributes(address, {'width': args.width, 'height': args.height})

    # --- 5. Generate Payload ---
    try:
        if args.type == 'led':
            # send_image_led generates a full bitmap frame (CMD_BITMAP_DATA_LED)
            # This calls send_command -> send_frame -> prepare_frame calling _send
            protocol.send_image_led(address, final_img)
            
        elif args.type == 'flipdot':
            # send_image_flipdot iterates across the image columns and sends
            # individual column updates (CMD_COLUMN_DATA_FLIPDOT)
            protocol.send_image_flipdot(address, final_img, col_offset=0)
            
    except Exception as e:
        print(f"Error generating payload: {e}")
        sys.exit(1)

    # --- 6. Write Output ---
    try:
        # Ensure directory exists
        out_dir = os.path.dirname(os.path.abspath(args.out))
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir)

        with open(args.out, 'wb') as f:
            f.write(protocol.packet_data)
        
        # print(f"Success: Wrote {len(protocol.packet_data)} bytes to {args.out}")
    except Exception as e:
        print(f"Error writing to output file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
