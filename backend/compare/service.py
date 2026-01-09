from backend.compare.registry import load_results

def compare_results(dataset, selected_tool):
    records = [r for r in load_results() if r["dataset"] == dataset]

    selected = None
    others = []

    for r in records:
        if r["tool"] == selected_tool:
            selected = r
        else:
            others.append(r)

    best_per_metric = {}
    for r in records:
        for k, v in r["metrics"].items():
            if k not in best_per_metric or v > best_per_metric[k]["value"]:
                best_per_metric[k] = {
                    "tool": r["tool"],
                    "value": v
                }

    return {
        "selected": selected,
        "others": others,
        "best_per_metric": best_per_metric
    }
