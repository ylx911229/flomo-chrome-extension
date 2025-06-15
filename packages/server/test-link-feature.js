const axios = require('axios');

// 测试原文链接功能
async function testLinkFeature() {
  const testData = {
    text: "这是一段测试文本，用来验证原文链接功能是否正常工作。",
    openrouterKey: "test-key", // 这里需要真实的key
    flomoApiUrl: "test-url", // 这里需要真实的URL
    sourceUrl: "https://example.com/test-article",
    pageTitle: "测试文章标题"
  };

  console.log('Testing link feature with data:', testData);

  try {
    const response = await axios.post('http://localhost:3001/api/summarize-to-flomo', testData);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// 运行测试
testLinkFeature(); 