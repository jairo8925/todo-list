const puppeteer = require('puppeteer');
const path = require('path');
// '..' since we're in the test/ subdirectory; learner is supposed to have src/index.html
const pagePath = 'file://' + path.resolve(__dirname, '../src/index.html');
const hs = require('hs-test-web');
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function stageTest() {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-infobar'],
        ignoreDefaultArgs: ['--enable-automation']
    });

    const page = await browser.newPage();
    await page.goto(pagePath);

    await sleep(1000);

    let result = await hs.testPage(page,
        // Test #1 - Check title
        () => {
            if (document.title !== 'To-Do List') {
                return hs.wrong("The title of the page should be 'To-Do List'")
            }
            return hs.correct();
        },

        // Test #2 - Check elements
        () => {
            const inputField = document.getElementById("input-task")
            if (inputField === null || inputField.tagName !== 'INPUT')
                return hs.wrong("Can't find input field with id '#input-task'")

            const addButton = document.getElementById("add-task-button")
            if (addButton === null || addButton.tagName !== 'BUTTON')
                return hs.wrong("Can't find button with id '#add-task-button'")

            this.taskList = document.getElementById("task-list")
            if (this.taskList === null || this.taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            return hs.correct();
        },

        // Test #3 - Check each task in task list
        () => {

            const tasks = this.taskList.getElementsByTagName("li")
            if (tasks.length !== 3)
                return hs.wrong("Inside the <ul> tag should be 3 <li> elements!")

            for (let task of tasks) {
                const checkbox = task.querySelector("input[type=checkbox]")
                if (checkbox === null)
                    return hs.wrong("Inside each <li> tag should one <input> tag with 'checkbox' type")

                const taskName = task.querySelector("span.task")
                if (taskName === null)
                    return hs.wrong("Inside each <li> tag should one <spane> tag with 'task' class")

                const deleteButton = task.querySelector("button.delete-btn")
                if (deleteButton === null)
                    return hs.wrong("Inside each <li> tag should one <button> tag with 'delete-btn' class")
            }

            return hs.correct();
        }
    );

    await browser.close();
    return result;
}


jest.setTimeout(30000);
test("Test stage", async () => {
        let result = await stageTest();
        if (result['type'] === 'wrong') {
            fail(result['message']);
        }
    }
);
