document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKey');
  const modelNameInput = document.getElementById('modelName');
  const captureBtn = document.getElementById('captureBtn');
  const analysesList = document.getElementById('analysesList');
  const statusDiv = document.getElementById('status');

  // Load saved API key and model name
  chrome.storage.sync.get(['openaiApiKey', 'modelName'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
    if (result.modelName) {
      modelNameInput.value = result.modelName;
    }
  });

  saveApiKeyBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const modelName = modelNameInput.value;
    chrome.storage.sync.set({ openaiApiKey: apiKey, modelName: modelName }, () => {
      statusDiv.textContent = 'API key and model name saved successfully!';
    });
  });

  captureBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Capturing screenshot...';
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const dataUrl = await chrome.tabs.captureVisibleTab();
      statusDiv.textContent = 'Screenshot captured. Analyzing...';
      await analyzeScreenshot(dataUrl, tab.url);
    } catch (error) {
      statusDiv.textContent = `Error: ${error.message}`;
    }
  });

  async function analyzeScreenshot(imageDataUrl, url) {
    statusDiv.textContent = 'Preparing to call OpenAI API...';
    
    const { openaiApiKey, modelName } = await chrome.storage.sync.get(['openaiApiKey', 'modelName']);
    
    if (!openaiApiKey) {
      statusDiv.textContent = 'Error: OpenAI API key not set';
      return;
    }

    const base64Image = imageDataUrl.split(',')[1];

    try {
      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: modelName || 'gpt-4o-mini',
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "What's in this image? Provide a title and brief notes." },
                { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 300
        })
      });

      statusDiv.textContent = `API response status: ${apiResponse.status}`;

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error:', errorText);
        let errorMessage = `HTTP error! status: ${apiResponse.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error && errorJson.error.message) {
            errorMessage += `, message: ${errorJson.error.message}`;
          }
        } catch (e) {
          errorMessage += `, message: ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await apiResponse.json();
      console.log('API Response:', result);
      
      const analysis = {
        url: url,
        title: result.choices[0].message.content.split('\n')[0],
        notes: result.choices[0].message.content.split('\n').slice(1).join('\n')
      };

      statusDiv.textContent = 'Analysis complete. Saving...';

      await new Promise((resolve) => {
        chrome.storage.local.get({analyses: []}, (result) => {
          const analyses = result.analyses;
          analyses.push(analysis);
          chrome.storage.local.set({analyses: analyses}, resolve);
        });
      });

      statusDiv.textContent = 'Analysis saved. Updating display...';
      updateAnalysesList();
    } catch (error) {
      console.error('Error in analyzeScreenshot:', error);
      statusDiv.textContent = `Error: ${error.message}`;
      if (error.message.includes('model_not_found')) {
        statusDiv.textContent += ' Please check your OpenAI account permissions and API key.';
      }
    }
  }

  function updateAnalysesList() {
    chrome.storage.local.get({analyses: []}, (result) => {
      const analyses = result.analyses;
      analysesList.innerHTML = '';
      analyses.forEach((analysis, index) => {
        const analysisEl = document.createElement('div');
        analysisEl.className = 'analysis';
        analysisEl.innerHTML = `
          <h3>${analysis.title}</h3>
          <p>URL: ${analysis.url}</p>
          <p>Notes: ${analysis.notes}</p>
        `;
        analysesList.appendChild(analysisEl);
      });
      statusDiv.textContent = 'Display updated.';
    });
  }

  updateAnalysesList();
});