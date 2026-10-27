import fs from 'node:fs/promises';
import path from 'node:path';
export async function connect() {
  const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
  const page = pages.find((item) => item.type === 'page');
  if (!page)
    throw new Error('Start Chrome with --remote-debugging-port=9223 and an isolated profile.');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(String(event.data));
    if (message.id) {
      const callbacks = pending.get(message.id);
      if (!callbacks) return;
      pending.delete(message.id);
      message.error
        ? callbacks.reject(new Error(JSON.stringify(message.error)))
        : callbacks.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(
        message.params.exceptionDetails.exception?.description ??
          message.params.exceptionDetails.text,
      );
  });
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description ?? result.exceptionDetails.text,
      );
    return result.result.value;
  }
  async function waitFor(expression) {
    for (let i = 0; i < 100; i++) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Timed out: ' + expression);
  }
  async function navigate(route) {
    await send('Page.navigate', { url: 'http://127.0.0.1:5173' + route });
    await waitFor('!!document.querySelector("h1")');
    await evaluate('document.fonts.ready.then(() => true)');
  }
  async function input(selector, value) {
    await evaluate(
      `(() => { const node = document.querySelector(${JSON.stringify(selector)}); if(!node) throw new Error('Missing input'); const proto = node.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(node,${JSON.stringify(value)}); node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', {bubbles:true})); })()`,
    );
  }
  async function click(selector) {
    await evaluate(
      `(() => { const node = document.querySelector(${JSON.stringify(selector)}); if(!node) throw new Error('Missing element: ' + ${JSON.stringify(selector)}); node.click(); })()`,
    );
  }
  async function clickText(text) {
    await evaluate(
      `(() => { const node = [...document.querySelectorAll('button,a')].find(node => node.textContent.trim() === ${JSON.stringify(text)}); if(!node) throw new Error('Missing action: ' + ${JSON.stringify(text)}); node.click(); })()`,
    );
  }
  async function screenshot(filename, width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await evaluate('document.fonts.ready.then(() => true)');
    await new Promise((resolve) => setTimeout(resolve, 150));
    const result = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    const directory = path.resolve('.review-artifacts');
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename + '.png'), Buffer.from(result.data, 'base64'));
  }
  await send('Page.enable');
  await send('Runtime.enable');
  return {
    send,
    evaluate,
    waitFor,
    navigate,
    input,
    click,
    clickText,
    screenshot,
    errors,
    close: () => socket.close(),
  };
}
