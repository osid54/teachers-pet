import random

def generate_bar_chart(title: str, x_labels: list[str], y_label: str, values: list[int], max_y: int = 50) -> str:
    """
    Generates an SVG string for a customizable bar chart.
    
    Args:
        title: The chart title (e.g., "Student Activities").
        x_labels: Labels for the x-axis (e.g., ['1', '2', '3', '4', '5']).
        y_label: The label for the y-axis (e.g., "Number of students").
        values: A list of bar heights/data points (e.g., [29, 31, 39, 43, 48]).
        max_y: The maximum value for the y-axis scale.
        
    Returns:
        A complete SVG string for the chart.
    """
    
    # --- Configuration ---
    SVG_WIDTH = 400
    SVG_HEIGHT = 300
    PADDING = 40 # Padding around the chart area for labels
    BAR_SPACING = 5
    CHART_AREA_WIDTH = SVG_WIDTH - 2 * PADDING
    CHART_AREA_HEIGHT = SVG_HEIGHT - 2 * PADDING
    
    num_bars = len(values)
    bar_and_gap_width = CHART_AREA_WIDTH / num_bars
    bar_width = bar_and_gap_width - BAR_SPACING
    
    # Scale calculation
    y_scale = CHART_AREA_HEIGHT / max_y

    svg_elements = []

    # --- Y-Axis Gridlines and Labels ---
    for i in range(0, max_y + 1, 5):
        y_pos = PADDING + CHART_AREA_HEIGHT - (i * y_scale)
        # Gridlines (every 5 units)
        svg_elements.append(f'<line x1="{PADDING}" y1="{y_pos}" x2="{SVG_WIDTH - PADDING}" y2="{y_pos}" stroke="#ccc" stroke-width="1" opacity="0.5"/>')
        # Y-Axis Labels
        svg_elements.append(f'<text x="{PADDING - 5}" y="{y_pos + 4}" text-anchor="end" font-size="12" fill="#333">{i}</text>')

    # --- Bars and X-Axis Labels ---
    for i, value in enumerate(values):
        x_start = PADDING + BAR_SPACING / 2 + i * bar_and_gap_width
        bar_height = value * y_scale
        y_start = PADDING + CHART_AREA_HEIGHT - bar_height
        
        # Draw Bar
        svg_elements.append(f'<rect x="{x_start}" y="{y_start}" width="{bar_width}" height="{bar_height}" fill="#999" rx="2" ry="2"/>')
        
        # X-Axis Label (Activity 1, 2, 3...)
        x_center = x_start + bar_width / 2
        svg_elements.append(f'<text x="{x_center}" y="{SVG_HEIGHT - PADDING + 15}" text-anchor="middle" font-size="12" fill="#333">{x_labels[i]}</text>')

    # --- Axes and Labels ---
    
    # Y-Axis Line
    svg_elements.append(f'<line x1="{PADDING}" y1="{PADDING}" x2="{PADDING}" y2="{SVG_HEIGHT - PADDING}" stroke="#333" stroke-width="2"/>')
    # X-Axis Line
    svg_elements.append(f'<line x1="{PADDING}" y1="{SVG_HEIGHT - PADDING}" x2="{SVG_WIDTH - PADDING}" y2="{SVG_HEIGHT - PADDING}" stroke="#333" stroke-width="2"/>')

    # X-Axis Label (Title at bottom)
    svg_elements.append(f'<text x="{SVG_WIDTH / 2}" y="{SVG_HEIGHT - 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">Activity</text>')
    
    # Y-Axis Label (Rotated)
    svg_elements.append(f'<text transform="rotate(-90)" x="{-SVG_HEIGHT/2}" y="15" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">{y_label}</text>')


    # --- Assemble Final SVG ---
    svg_string = f"""
    <div style="border: 1px solid #ccc; border-radius: 5px; margin: 10px 0; padding: 5px;">
    <svg width="{SVG_WIDTH}" height="{SVG_HEIGHT + 30}" style="display: block;">
        {"\n".join(svg_elements)}
    </svg>
    </div>
    """
    return svg_string

def format_equation(raw_latex_expr: str, inline=False) -> str:
    """
    Formats a raw LaTeX string for display in the question text.
    
    The resulting string must be processed by a MathJax or KaTeX library 
    on the front-end for proper rendering.
    """
    # Use $$...$$ delimiters for a centered, displayed equation block
    delimiter = "$" if inline else "$$"
    return f"{delimiter} {raw_latex_expr} {delimiter}"