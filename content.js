chrome.runtime.onMessage.addListener(function (message, sender, callback) {
  if (message.functiontoInvoke == "onClick") {
    var io = onClick();
    
    chrome.storage.sync.get({
      language: 'Java',
    }, function(items) {
      switch(items.language){
        case "Java":
          copy(createJUnit(io));
          break;
        case "CSharp":
          copy(createMSTest(io));
          break;
        case "Python3":
          copy(createPyUnittest(io));
          break;
        case "Kotlin":
          copy(createJUnitKotlin(io));
          break;
        default:
          throw new Error("Unknown language. [items.language=" + items.language + "]");
      }
    });
  }
});

function onClick(){
  var name = null;
  var input = null;
  var output = null;
  var io = [];

  var sample_tests = $("#pageContent > div.problemindexholder > div.ttypography > div > div.sample-tests > div.sample-test > div");
  var num = 0;
  for (var i = 0; i < sample_tests.length; i++) {
    var sample_test = $(sample_tests[i]);
    var children = sample_test[0].children;
    var header = children[0].firstChild.textContent.trim();
    var data = children[1].firstChild.textContent.trim();
  
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

function createJUnit(io){
  var text = 
`import static org.hamcrest.CoreMatchers.is;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import org.junit.Assert;
import org.junit.Test;

public class MainTest {
`;
  
  for(var i = 0; i < io.length; i++){
    text += `
	@Test
	public void ${io[i].name}() throws Exception {
		String input = 
			"${io[i].input.trim("\n").replace(/\n/g, '" + System.lineSeparator() +\n			"')}";
		String output = 
			"${io[i].output.trim("\n").replace(/\n/g, '" + System.lineSeparator() +\n			"')}";

		assertIO(input, output);
	}
`;
  }
  
  text += `
	private void assertIO(String input, String output) throws Exception {
		ByteArrayInputStream in = new ByteArrayInputStream(input.getBytes());
		System.setIn(in);

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		System.setOut(new PrintStream(out));

		Main.main(new String[0]);

		Assert.assertThat(out.toString(), is(output + System.lineSeparator()));
	}
}
`;
  
  return text;
};

function createMSTest(io){
  var text = 
`using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;

namespace Codeforces
{
    [TestClass]
    public class ProgramTest
    {`;
  
  for(var i = 0; i < io.length; i++){
    text += `
        [TestMethod]
        public void ${io[i].name}()
        {
            string input =
@"${io[i].input.trim("\n").replace(/\n/g, '\r\n')}";
            string output =
@"${io[i].output.trim("\n").replace(/\n/g, '\r\n')}";

            AssertIO(input, output);
        }
`;
  }
  
  text += `
        private void AssertIO(string input, string output)
        {
            StringReader reader = new StringReader(input);
            Console.SetIn(reader);

            StringWriter writer = new StringWriter();
            Console.SetOut(writer);

            Program.Main(new string[0]);

            Assert.AreEqual(output + Environment.NewLine, writer.ToString());
        }
    }
}
`;
  
  return text;
}

function createPyUnittest(io) {
  var text = 
`import sys
from io import StringIO
import unittest


class TestClass(unittest.TestCase):
    def assertIO(self, input, output):
        stdout, stdin = sys.stdout, sys.stdin
        sys.stdout, sys.stdin = StringIO(), StringIO(input)
        resolve()
        sys.stdout.seek(0)
        out = sys.stdout.read()[:-1]
        sys.stdout, sys.stdin = stdout, stdin
        self.assertEqual(out, output)

`;
  
  for(var i = 0; i < io.length; i++){
    text += 
`    def test_${io[i].name}(self):
        input = """${io[i].input.trim("\n").replace(/\n/g, '\r\n')}"""
        output = """${io[i].output.trim("\n").replace(/\n/g, '\r\n')}"""
        self.assertIO(input, output)

`;
  }

  text += `
if __name__ == "__main__":
    unittest.main()
`;
  
  return text;
}

function createJUnitKotlin(io){
  var text = 
`import org.hamcrest.CoreMatchers.equalTo
import org.junit.Assert
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PrintStream

class MainTest {
`;
  
  for(var i = 0; i < io.length; i++){
    text +=`
    @Test
    fun ${io[i].name}() {
        val input =
            "${io[i].input.trim("\n").replace(/\n/g, '" + System.lineSeparator() +\n            "')}";
        val output =
            "${io[i].output.trim("\n").replace(/\n/g, '" + System.lineSeparator() +\n            "')}";

        assertIO(input, output);
    }
`;
  }
  
  text +=`
    private fun assertIO(input: String, output: String) {
        val sysIn = ByteArrayInputStream(input.toByteArray())
        System.setIn(sysIn)

        val sysOut = ByteArrayOutputStream()
        System.setOut(PrintStream(sysOut))

        cf0000X()

        Assert.assertThat(sysOut.toString(), equalTo(output + System.lineSeparator()))
    }
}
`;
  
  return text;
};

function copy(text){
    var textArea = document.createElement("textarea");
    textArea.style.cssText = "position: absolute; left: -100%;";

    try{
        document.body.appendChild(textArea);

        textArea.value = text;
        textArea.select();
    
        document.execCommand("copy");
    }finally{
        document.body.removeChild(textArea);
    }
}
