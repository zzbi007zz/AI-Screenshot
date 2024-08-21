chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, (dataUrl) => {
      console.log('Screenshot captured');
      // Save the screenshot
      const filename = `screenshot_${Date.now()}.png`;
      chrome.downloads.download({
        url: dataUrl,
        filename: 'img/' + filename,
        saveAs: false
      }, (downloadId) => {
        console.log('Screenshot saved, download ID:', downloadId);
        // Get the downloaded file path
        chrome.downloads.search({id: downloadId}, (downloads) => {
          if (downloads && downloads[0]) {
            const filePath = downloads[0].filename;
            console.log('Screenshot file path:', filePath);
            analyzeScreenshot(dataUrl, sender.tab.url);
          } else {
            console.error('Failed to get download information');
          }
        });
      });
    });
  }
});

async function analyzeScreenshot(imageDataUrl, url) {
  console.log('Analyzing screenshot...');
  console.log('URL:', url);
  
  // Get API key from storage
  try {
    const { openaiApiKey } = await chrome.storage.sync.get(['openaiApiKey']);
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not set');
      return;
    }

    console.log('API key retrieved successfully');

    // Extract base64 image data
    const base64Image = imageDataUrl.split(',')[1];
    console.log('Base64 image data length:', base64Image.length);

    console.log('Preparing to call GPT-4 Vision API');

    // Call GPT-4 Vision API
    const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
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

    console.log('API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`HTTP error! status: ${apiResponse.status}, message: ${errorText}`);
    }

    const result = await apiResponse.json();
    console.log('API result:', result);

    const analysis = {
      url: url,
      title: result.choices[0].message.content.split('\n')[0], // Assuming the first line is the title
      notes: result.choices[0].message.content.split('\n').slice(1).join('\n') // The rest is notes
    };

    console.log('Analysis:', analysis);

    // Save the analysis
    chrome.storage.local.get({analyses: []}, (result) => {
      const analyses = result.analyses;
      analyses.push(analysis);
      chrome.storage.local.set({analyses: analyses}, () => {
        console.log('Analysis saved to storage');
        // Notify the popup to update
        chrome.runtime.sendMessage({action: "updateAnalyses"});
      });
    });

  } catch (error) {
    console.error('Error in analyzeScreenshot:', error);
    if (error.message.includes('API key')) {
      console.error('API Key error. Please check your OpenAI API key.');
    }
  }
}