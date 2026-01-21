import os
import re
from pathlib import Path

# Base directory
base_dir = r"c:\Users\5907\Documents\Projects\Tsediyalo\TrustLens\frontend\src"

# Counter for changes
files_modified = 0

def remove_uppercase_class(file_path):
    """Remove 'uppercase' class from className strings while preserving file structure"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match className with uppercase
        # This matches: className="... uppercase ..." or className={cn("... uppercase ...")}
        patterns = [
            # Simple className with uppercase
            (r'className="([^"]*)\suppercase\s([^"]*)"', r'className="\1 \2"'),
            (r'className="([^"]*)\suppercase"', r'className="\1"'),
            (r'className="uppercase\s([^"]*)"', r'className="\1"'),
            (r'className="uppercase"', r'className=""'),
            
            # Template literal className
            (r"className=\{`([^`]*)\suppercase\s([^`]*)`\}", r"className={`\1 \2`}"),
            (r"className=\{`([^`]*)\suppercase`\}", r"className={`\1`}"),
            (r"className=\{`uppercase\s([^`]*)`\}", r"className={`\1`}"),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        # Clean up double spaces
        content = re.sub(r'className="(\s+)"', r'className=""', content)
        content = re.sub(r'className="([^"]*?)\s\s+([^"]*?)"', r'className="\1 \2"', content)
        content = re.sub(r'className=\{`(\s+)`\}', r'className={``}', content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    return False

# Process all .tsx and .ts files
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
            file_path = os.path.join(root, file)
            if remove_uppercase_class(file_path):
                files_modified += 1
                print(f"Modified: {file_path}")

print(f"\nTotal files modified: {files_modified}")
