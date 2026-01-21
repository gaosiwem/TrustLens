import re

def reconstruct_js_file(input_path, output_path):
    """Intelligently add line breaks to a JavaScript/TypeScript file that's on one line"""
    
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 1: Add newlines after common patterns
    # Add newline after import statements
    content = re.sub(r'(import\s+.*?;)\s*', r'\1\n', content)
    
    # Add newline after semicolons (but not in for loops)
    content = re.sub(r';\s*(?![)\s])', ';\n', content)
    
    # Add newline after opening braces
    content = re.sub(r'\{\s*(?![\s}])', '{\n', content)
    
    # Add newline before closing braces
    content = re.sub(r'\s*\}', '\n}', content)
    
    # Add newline after function declarations
    content = re.sub(r'(\)\s*=>\s*\{)', r')\n=> {\n', content)
    
    # Add newline after const/let/var declarations with arrow functions
    content = re.sub(r'(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*)\{', r'\1{\n', content)
    
    # Add proper spacing for React components
    content = re.sub(r'(export\s+default\s+function)', r'\n\1', content)
    content = re.sub(r'(function\s+\w+)', r'\n\1', content)
    
    # Add newlines before return statements
    content = re.sub(r'\s+(return\s+\()', r'\n\1', content)
    
    # Clean up multiple consecutive newlines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Add proper indentation (basic)
    lines = content.split('\n')
    indented_lines = []
    indent_level = 0
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            indented_lines.append('')
            continue
            
        # Decrease indent for closing braces
        if stripped.startswith('}') or stripped.startswith(']') or stripped.startswith(')'):
            indent_level = max(0, indent_level - 1)
        
        # Add the line with proper indentation
        indented_lines.append('  ' * indent_level + stripped)
        
        # Increase indent after opening braces
        if stripped.endswith('{') or stripped.endswith('[') or stripped.endswith('('):
            indent_level += 1
        # Decrease after closing on same line
        if stripped.endswith('}') or stripped.endswith(']') or stripped.endswith(')'):
            if not (stripped.startswith('}') or stripped.startswith(']') or stripped.startswith(')')):
                indent_level = max(0, indent_level - 1)
    
    content = '\n'.join(indented_lines)
    
    # Write the reconstructed file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Reconstructed {input_path}")
    print(f"Output written to {output_path}")
    return True

# Reconstruct the dashboard file
input_file = r"c:\Users\5907\Documents\Projects\Tsediyalo\TrustLens\frontend\src\app\dashboard\page.tsx"
output_file = r"c:\Users\5907\Documents\Projects\Tsediyalo\TrustLens\frontend\src\app\dashboard\page.tsx"

reconstruct_js_file(input_file, output_file)
print("Dashboard file reconstruction complete!")
