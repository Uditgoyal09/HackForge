import json

log_file = r'c:\Users\uditg\.gemini\antigravity-ide\brain\4c6a145e-c23b-4576-8015-44bc468bb3cf\.system_generated\logs\transcript_full.jsonl'
try:
    with open(log_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"Total lines: {len(lines)}")
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
            except Exception as e:
                pass
        print("LandingPage changes at steps:", [c[0] for c in changes])
        for c in changes:
            if c[0] == 2186 or c[0] > 2186:
                print(c[0])
except Exception as e:
    print("Error:", e)
