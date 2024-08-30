chrome.runtime.onMessage.addListener(function (message, sender, callback) {
  if (message.functiontoInvoke != "onClick") {
    return;
  }

  const examples = onClick();
  chrome.storage.sync.get(["outer", "inner"], function (items) {
    const method = examples.map(e =>
      items.inner
        .replace(/{{\s*NAME*\s}}/g, e.name)
        .replace(/{{\s*INPUT\s*}}/g, e.input)
        .replace(/{{\s*OUTPUT\s*}}/g, e.output)
    ).join("\n");
    const code = items.outer.replace(/{{\s*METHOD\s*}}/g, method);

    callback(code);
  });

  return true;
});

function onClick() {
  var name = null;
  var input = null;
  var output = null;
  var io = [];

  var sample_tests = document.querySelectorAll("#pageContent > div.problemindexholder > div.ttypography > div > div.sample-tests > div.sample-test > div");
  var num = 0;

  for (var i = 0; i < sample_tests.length; i++) {
    var children = sample_tests[i].children;
    var header = children[0].firstChild.textContent.trim();
    var data = children[1].innerText.trim();



    if (header.indexOf("Input") == 0 || header.indexOf("Входные данные") == 0) {
      // Input0
      name = header.replace(/\s+/g, "_") + num;
      input = data;
      num += 1;
    } else if (header.indexOf("Output") == 0 || header.indexOf("Выходные данные") == 0) {
      output = data;
    }


    if (name != null && input != null && output != null) {
      io.push({ name: name, input: input, output: output });
      name = input = output = null;
    }
  }

  return io;
}
