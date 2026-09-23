"""Extract the 24 px icons from the supplied contact sheet into typed icon data."""

import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "icons" / "contact-sheet.svg"
DESTINATION = ROOT / "src" / "components" / "icons" / "icon-paths.generated.ts"
SVG = "{http://www.w3.org/2000/svg}"
ATTRIBUTE_NAMES = {
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-dasharray": "strokeDasharray",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
}
ALLOWED_TAGS = {"circle", "ellipse", "line", "path", "polyline", "rect"}
ALLOWED_ATTRIBUTES = {
    "cx", "cy", "d", "fill", "height", "points", "r", "rx", "ry",
    "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin",
    "stroke-width", "width", "x", "x1", "x2", "y", "y1", "y2",
}


def icon_nodes(group: ET.Element) -> list[dict[str, object]]:
    for child in group:
        tag = child.tag.removeprefix(SVG)
        if tag not in ALLOWED_TAGS or not set(child.attrib).issubset(ALLOWED_ATTRIBUTES):
            raise ValueError(f"Unsupported SVG content in {tag}")
    return [
        {
            "tag": child.tag.removeprefix(SVG),
            "props": {
                ATTRIBUTE_NAMES.get(key, key): value
                for key, value in child.attrib.items()
            },
        }
        for child in group
    ]


def find_group(groups: list[ET.Element], x: float, y: float) -> ET.Element:
    matches = []
    for group in groups:
        match = re.fullmatch(
            r"translate\(([^,]+),([^\)]+)\)", group.get("transform", "")
        )
        if match and abs(float(match[1]) - x) < 0.1 and abs(float(match[2]) - y) < 0.1:
            matches.append(group)
    if len(matches) != 1:
        raise ValueError(f"Expected one icon at ({x}, {y}), got {len(matches)}")
    return matches[0]


def main() -> None:
    root = ET.parse(SOURCE).getroot()
    groups = [element for element in root if element.tag == f"{SVG}g"]
    labels = [
        element
        for element in root
        if element.tag == f"{SVG}text" and element.get("font-size") == "11"
    ]
    captions = [
        element
        for element in root
        if element.tag == f"{SVG}text" and element.get("font-size") == "9"
    ]
    icons: dict[str, dict[str, list[dict[str, object]]]] = {}

    for label in labels:
        name = label.text
        if not name:
            continue
        x, y = float(label.get("x", "0")), float(label.get("y", "0"))
        outline = icon_nodes(find_group(groups, x - 141, y - 14))
        caption = next(
            (
                item
                for item in captions
                if abs(float(item.get("x", "0")) - x) < 0.1
                and abs(float(item.get("y", "0")) - (y + 16)) < 0.1
            ),
            None,
        )
        definition = {"outline": outline}
        if caption is not None and "filled" in (caption.text or ""):
            definition["filled"] = icon_nodes(find_group(groups, x - 73, y - 14))
        if name in icons and icons[name] != definition:
            raise ValueError(f"Conflicting drawings for duplicate icon: {name}")
        icons[name] = definition

    names = list(icons)
    content = (
        "// Generated from assets/icons/contact-sheet.svg. Do not edit by hand.\n"
        f"export const iconNames = {json.dumps(names, ensure_ascii=False)} as const;\n"
        "export type IconName = (typeof iconNames)[number];\n"
        "export type IconNode = { tag: string; props: Record<string, string> };\n"
        "export type IconDefinition = { outline: IconNode[]; filled?: IconNode[] };\n"
        f"export const iconPaths: Record<IconName, IconDefinition> = {json.dumps(icons, ensure_ascii=False, indent=2)};\n"
    )
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    DESTINATION.write_text(content, encoding="utf-8")
    print(f"Generated {len(names)} icons in {DESTINATION}")


if __name__ == "__main__":
    main()
