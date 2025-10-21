# Trading_View_Trend_Line

A Python-based tool for automatically detecting and drawing trend lines on charts from TradingView, helping traders identify key support and resistance levels.

## 🚀 Features

* Automatically identifies significant swing highs and lows on price data.
* Draws trend lines based on connected swing points (support and resistance).
* Configurable parameters (e.g., sensitivity for swing detection, minimum slope, lookback window).
* Clean chart visuals designed for TradingView-style display.
* Useful for trend-following, breakout, and reversal strategies.

## 🧰 Requirements

* Python 3.7+
* Pandas (for data handling)
* NumPy (numerical computations)
* Matplotlib or Plotly (for visualization, optional)
* Other dependencies as listed in `requirements.txt` (if included)

## 📁 Repository Structure

```
Trading_View_Trend_Line/
├── data/                     # Sample price data (e.g., CSV files)  
├── src/                      # Core source code for trend-line detection  
│   ├── swing_detector.py     # Module to detect swing highs & lows  
│   ├── trendline_drawer.py   # Module that constructs and draws trend lines  
│   └── utils.py              # Utility/helper functions  
├── examples/                 # Scripts demonstrating usage  
│   └── demo_trendlines.py    # Sample run of tool with sample data  
├── tests/                    # Unit tests for modules  
├── README.md                 # This file  
└── requirements.txt          # Python dependencies  
```

> **Note:** Adjust this structure according to your actual folder layout.

## 🔧 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Samualsi/Trading_View_Trend_Line.git
   cd Trading_View_Trend_Line
   ```
2. (Optional) Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate     # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

## 🎬 Usage

1. Prepare your input price data (e.g., CSV with columns Date, Open, High, Low, Close).
2. Configure the settings in `demo_trendlines.py` (or your preferred script):

   ```python
   from src.swing_detector import SwingDetector
   from src.trendline_drawer import TrendlineDrawer

   # Load data
   df = ...  # pandas DataFrame with price series

   # Detect swing points
   detector = SwingDetector(window=10, threshold=0.02)
   swings = detector.detect(df['Close'])

   # Draw trendlines
   drawer = TrendlineDrawer(min_length=5, min_slope=0.1)
   trendlines = drawer.build(swings)
   drawer.plot(df, trendlines)
   ```
3. Review the plotted chart: the trend lines superimposed on the price data will highlight structural areas.

## ⚙️ Configuration Options

Below are common parameters you can customize:

* `window`: Number of bars to inspect for a swing high/low (default: e.g., 10)
* `threshold`: Percentage move from swing point to qualify (e.g., 0.02 for 2%)
* `min_length`: Minimum number of bars between two connected swing points to form a line
* `min_slope`: Minimum absolute slope of a trend line (prevents horizontal lines)
* `lookback`: How far back in data the algorithm will search

## 🧪 Testing

Run unit tests to ensure detection logic remains solid. Example:

```bash
pytest tests/
```

Ensure all tests pass before making changes.

## 🎯 Use Cases

* Identify key support and resistance trend lines.
* Spot potential breakout or breakdown levels.
* Visualise trend structure in your trading analysis dashboards.
* Integrate into algorithmic strategies or manual trading workflows.

## 📚 Background / How It Works

The tool follows a two-step logic:

1. **Swing detection** — the tool scans for local peaks and troughs in the price series, based on a sliding window and threshold criteria.
2. **Trend-line construction** — once swing points are identified, the algorithm pairs swing highs (for resistance) or swing lows (for support), filters by slope and distance, and selects the strongest lines (by frequency or significance) for drawing.
   This approach mirrors how many manual analysts draw trend lines: connecting successive swing highs or lows to form structural lines.

## 🧩 Limitations & Caveats

* Purely mechanical: may draw lines that lack real-world significance if parameters aren’t tuned.
* Works best on clean data; market noise or side-ways action can reduce meaningful lines.
* Past trend lines don’t guarantee future support/resistance; always combine with other tools.

## 📬 Contributing

Contributions are welcome! If you’d like to improve the tool (e.g., add breakout detection, auto-annotations, TradingView Pine export, GUI, etc.):

* Fork the repository
* Create a topic branch (`git checkout -b feature-xyz`)
* Commit your changes with clear messages
* Submit a pull request
* Please include tests for new logic and update documentation accordingly

## 📝 License

This project is licensed under the MIT License — see the `LICENSE` file for details.

## 🙏 Acknowledgements

Thanks for initiating the project. Inspired by manual technical analysis techniques used by many traders in the TradingView community.
