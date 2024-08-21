# AI Screenshot Extension

The AI Screenshot Extension is a Chrome extension that captures screenshots of the current webpage and analyzes them using OpenAI's GPT-4o-mini model. It provides a title and brief notes about the content of the screenshot.

## Features

- Capture screenshots of the current webpage
- Analyze screenshots using OpenAI's GPT-4o-mini model
- Display analysis results including a title and brief notes
- Save and view multiple analyses

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `ai-screenshot-extension` folder.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Enter your OpenAI API key in the "OpenAI API Key" field.
3. Verify that the "Model Name" field contains "gpt-4o-mini" (or your preferred OpenAI model with vision capabilities).
4. Click the "Save API Key" button to save your API key and model name.
5. Click the "Capture Screenshot" button to capture and analyze the current webpage.
6. View the analysis results in the popup window.

## Configuration

- **API Key**: Enter your OpenAI API key in the provided field. This key is required to use the OpenAI API for image analysis.
- **Model Name**: By default, the extension uses the "gpt-4o-mini" model. You can change this to any other OpenAI model that supports image analysis.

## Files

- `manifest.json`: Extension configuration file
- `popup.html`: HTML structure for the extension popup
- `popup.js`: JavaScript file handling the extension's functionality
- `styles.css`: CSS file for styling the popup

## Development

To modify the extension:

1. Edit the relevant files (`popup.html`, `popup.js`, `styles.css`).
2. Save your changes.
3. Go to `chrome://extensions/` in Chrome.
4. Click the "Reload" button for the AI Screenshot Extension.

## Troubleshooting

If you encounter any issues:

1. Ensure your OpenAI API key is correct and has the necessary permissions.
2. Check that your OpenAI account has access to the specified model (e.g., gpt-4o-mini).
3. Look for error messages in the extension popup or the browser console (right-click the extension icon and select "Inspect" to open Developer Tools).

## Privacy and Security

This extension sends screenshot data to OpenAI for analysis. Ensure you have the necessary rights and permissions to share the captured screenshots. The API key is stored locally in the browser and is not shared with any third parties.

## License

[MIT License](LICENSE)

## Disclaimer

This extension is not affiliated with, officially connected to, or endorsed by OpenAI. Use it at your own risk and in compliance with OpenAI's terms of service.