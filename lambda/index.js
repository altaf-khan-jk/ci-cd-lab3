exports.handler = async function(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: process.env.MESSAGE || 'Hello from Lambda!',
      input: event
    })
  };
};