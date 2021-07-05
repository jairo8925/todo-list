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
        },

        // Test #4 - Test adding new task
        () => {

            const inputField = document.getElementById("input-task")
            if (inputField.tagName !== 'INPUT')
                return hs.wrong("Can't find input field with id '#input-task'")

            inputField.value = "New task for the test purpose"

            const addButton = document.getElementById("add-task-button")
            if (addButton.tagName !== 'BUTTON')
                return hs.wrong("Can't find button with id '#add-task-button'")

            addButton.click()

            const tasks = this.taskList.getElementsByTagName("li")
            if (tasks.length !== 4)
                return hs.wrong("After adding a new task to the To-Do list, there should be 4 <li> tags inside the <ul> list")

            for (let task of tasks) {

                const taskName = task.querySelector("span.task")
                if (taskName === null)
                    return hs.wrong("Inside each <li> tag should one <spane> tag with 'task' class")

                if (taskName.textContent === "New task for the test purpose") {
                    return hs.correct()
                }
            }

            return hs.wrong("Can't find task with name 'New task for the test purpose'.\n" +
                "The task name should be placed in <span> tag with class 'task'!")
        },

        // Test #5 - Deleting task
        () => {

            let tasks = this.taskList.getElementsByTagName("li")

            for (let task of tasks) {
                const taskName = task.querySelector("span.task")
                if (taskName === null)
                    return hs.wrong("Inside each <li> tag should one <spane> tag with 'task' class")

                if (taskName.textContent === "New task for the test purpose") {
                    const deleteButton = task.querySelector("button.delete-btn")
                    if (deleteButton === null)
                        return hs.wrong("Inside each <li> tag should one <button> tag with 'delete-btn' class")
                    deleteButton.click()
                    break
                }
            }

            tasks = this.taskList.getElementsByTagName("li")

            for (let task of tasks) {
                const taskName = task.querySelector("span.task")
                if (taskName === null)
                    return hs.wrong("Inside each <li> tag should one <span> tag with 'task' class")

                if (taskName.textContent === "New task for the test purpose") {
                    return hs.wrong("After deleting a task with name 'New task for the test purpose' it is still in the task list!")
                }
            }

            return hs.correct()
        },

        // Test #6 - Check completed tasks
        async () => {

            const tasks = this.taskList.getElementsByTagName("li")

            if (tasks.length !== 3)
                return hs.wrong("After adding a new task to the To-Do list, there should be 3 <li> tags inside the <ul> list")

            const task = tasks[1]

            const checkbox = task.querySelector("input[type=checkbox]")

            if (checkbox.checked) {
                return hs.wrong("By default a checkbox should be unchecked!")
            }

            checkbox.click()

            let taskName = task.querySelector("span.task")
            if (taskName === null)
                return hs.wrong("Inside each <li> tag should be one <span> tag with 'task' class")

            if (!window.getComputedStyle(taskName).textDecoration.includes("line-through")) {
                return hs.wrong("If checkbox is checked the task name should be crossed out.\n" +
                    "The span tag with task name should have 'text-decoration: line-trough' style")
            }

            checkbox.click()

            if (window.getComputedStyle(taskName).textDecoration.includes("line-through")) {
                return hs.wrong("If checkbox is unchecked the task name shouldn't be crossed out.\n" +
                    "The span tag with task name shouldn't have 'text-decoration: line-trough' style")
            }

            return hs.correct()
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
