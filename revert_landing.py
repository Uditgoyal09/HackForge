import json
import os

log_file = r'c:\Users\uditg\.gemini\antigravity-ide\brain\4c6a145e-c23b-4576-8015-44bc468bb3cf\.system_generated\logs\transcript_full.jsonl'
target_file = r'c:\Users\uditg\OneDrive\Attachments\Desktop\PEP\Summer PEP\Summer pep capstone project\client\src\pages\public\LandingPage.jsx'

with open(log_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

changes = []
for line in lines:
    try:
        d = json.loads(line)
        if d.get('type') == 'PLANNER_RESPONSE' and d.get('tool_calls'):
            for tc in d['tool_calls']:
                if tc['name'] in ['replace_file_content', 'multi_replace_file_content']:
                    args = tc.get('args', {})
                    if 'LandingPage.jsx' in args.get('TargetFile', ''):
                        changes.append((d['step_index'], args))
    except:
        pass

# We want to reverse changes from steps >= 2201
with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Reverse changes in reverse chronological order
for step, args in reversed(changes):
    if step >= 2201:
        print(f"Reversing step {step}")
        if 'ReplacementChunks' in args:
            for chunk in args['ReplacementChunks']:
                target = chunk['TargetContent']
                replacement = chunk['ReplacementContent']
                if replacement in content:
                    content = content.replace(replacement, target)
                else:
                    print(f"Could not find replacement block for step {step}")
        else:
            target = args['TargetContent']
            replacement = args['ReplacementContent']
            if replacement in content:
                content = content.replace(replacement, target)
            else:
                print(f"Could not find replacement block for step {step}")

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted LandingPage.jsx")
