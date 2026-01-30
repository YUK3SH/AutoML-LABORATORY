from backend.compare.registry import load_results

def compare_results(dataset: str, selected_tool: str):
    records = [
        r for r in load_results()
        if r.get("dataset") == dataset
    ]

    selected = None
    others = []

    for r in records:
        if r.get("tool") == selected_tool:
            selected = r
        else:
            others.append(r)

    # compute best-per-metric across ALL tools
    best_per_metric = {}

    for r in records:
        metrics = r.get("metrics", {})
        for k, v in metrics.items():
            if not isinstance(v, (int, float)):
                continue
            if k not in best_per_metric or v > best_per_metric[k]["value"]:
                best_per_metric[k] = {
                    "tool": r.get("tool"),
                    "value": v,
                    "model": r.get("best_model"),
                }

    return {
        "selected": selected,
        "others": others,
        "best_per_metric": best_per_metric,
    }
