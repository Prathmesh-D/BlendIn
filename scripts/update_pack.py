import sys
import re
import os
import argparse

def camel_case(s):
    # Convert "Indian Movies" to "indianMoviesPack"
    parts = re.split(r'[^a-zA-Z0-9]', s)
    parts = [p for p in parts if p]
    if not parts:
        return "customPack"
    return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:]) + "Pack"

def kebab_case(s):
    # Convert "Indian Movies" to "builtin-indian-movies"
    parts = re.split(r'[^a-zA-Z0-9]', s)
    parts = [p.lower() for p in parts if p]
    return "builtin-" + "-".join(parts)

def generate_pack_ts(pack_name, description, csv_path):
    var_name = camel_case(pack_name)
    pack_id = kebab_case(pack_name)
    prefix = pack_id.replace('builtin-', '')[:6] # e.g. "indian"

    with open(csv_path, 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f if line.strip()]

    out = []
    out.append(f"// ─────────────────────────────────────────────────────────────────────────────")
    out.append(f"// PACK: {pack_name}")
    out.append(f"// ─────────────────────────────────────────────────────────────────────────────")
    out.append(f"const {var_name}: WordPack = {{")
    out.append(f"  id: '{pack_id}',")
    out.append(f"  name: '{pack_name}',")
    out.append(f"  description: '{description}',")
    out.append(f"  words: [")

    for i, line in enumerate(lines):
        parts = [p.strip().replace("'", "\\'") for p in line.split(',')]
        if len(parts) >= 5:
            primary = parts[0]
            easy = parts[1]
            med = parts[2]
            hard = parts[3]
            hint = parts[4]
            out.append(f"    {{ id: '{prefix}-{i+1:02d}', primary_word: '{primary}', decoy_easy: '{easy}', decoy_medium: '{med}', decoy_hard: '{hard}', hint_text: '{hint}', mirror_group_id: '{prefix}-group-{i//5:02d}' }},")

    out.append("  ],")
    out.append("};")
    return "\n".join(out), var_name

def update_builtin_packs(pack_name, description, csv_path, target_file="src/data/builtinPacks.ts"):
    new_pack_str, var_name = generate_pack_ts(pack_name, description, csv_path)
    
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if pack variable already exists
    regex_str = rf"(// ─────────────────────────────────────────────────────────────────────────────\s*// PACK:? {re.escape(pack_name)}.*?const {var_name}: WordPack = \{{.*?words: \[.*?\]\,\n\}};)"
    match = re.search(regex_str, content, re.DOTALL | re.IGNORECASE)
    
    if not match:
        # Fallback check just for the variable name
        regex_str_var = rf"(const {var_name}: WordPack = \{{.*?words: \[.*?\]\,\n\}};)"
        match = re.search(regex_str_var, content, re.DOTALL)

    if match:
        print(f"Updating existing pack: {var_name}")
        content = content[:match.start()] + new_pack_str + content[match.end():]
    else:
        print(f"Adding new pack: {var_name}")
        # Insert before export const BUILTIN_PACKS
        insert_marker = "// All built-in packs export"
        insert_idx = content.find(insert_marker)
        if insert_idx == -1:
            print("Could not find insert marker!")
            return

        # Go back a few lines to before the horizontal rule
        rule_idx = content.rfind("// ───", 0, insert_idx)
        if rule_idx != -1:
            insert_idx = rule_idx
        
        content = content[:insert_idx] + new_pack_str + "\n\n" + content[insert_idx:]
        
        # Add to BUILTIN_PACKS array
        array_regex = r"(export const BUILTIN_PACKS: WordPack\[\] = \[\s*)(.*?)(\s*\];)"
        array_match = re.search(array_regex, content, re.DOTALL)
        if array_match:
            items_str = array_match.group(2)
            items = [item.strip() for item in items_str.split(',') if item.strip()]
            if var_name not in items:
                items.append(var_name)
            
            new_array_str = "export const BUILTIN_PACKS: WordPack[] = [\n  " + ",\n  ".join(items) + ",\n];"
            content = content[:array_match.start()] + new_array_str + content[array_match.end():]

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Successfully processed {pack_name}!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update built-in word packs from CSV")
    parser.add_argument("name", help="Name of the pack (e.g. 'Indian Movies')")
    parser.add_argument("description", help="Short description of the pack")
    parser.add_argument("csv", help="Path to the CSV file")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.csv):
        print(f"Error: CSV file '{args.csv}' not found.")
        sys.exit(1)
        
    update_builtin_packs(args.name, args.description, args.csv)
