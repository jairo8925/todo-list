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
        ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();
    await page.coverage.startCSSCoverage();
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

        // Test #2 - delete all the tasks
        async () => {

            let taskList = document.getElementById("task-list")

            if (taskList === null || taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            let tasks = taskList.getElementsByTagName("li")

            const numberOfTasks = tasks.length;
            let counter = 0;

            while (true) {

                if (counter > numberOfTasks) {
                    return hs.wrong("Looks like after deleting a task it is not removed from the task list!")
                }

                const deleteButton = document.querySelector("button.delete-btn")
                if (deleteButton === null) {
                    break
                }
                deleteButton.click()

                counter++
            }

            taskList = document.getElementById("task-list")
            if (taskList === null || taskList.tagName !== 'UL')
                return hs.wrong("After deleting the tasks can't find <ul> tag with id '#task-list'")

            tasks = taskList.getElementsByTagName("li")

            if (tasks.length !== 0) {
                return hs.wrong("After deleting all the tasks there shouldn't be any <li> tag")
            }

            return hs.correct()
        },

        // Test #3 - adding tasks
        async () => {
            const tasksName = ['First task', 'Second task', 'Third task', 'Fourth task', 'Fifth task']

            const inputField = document.getElementById("input-task")
            if (inputField === null || inputField.tagName !== 'INPUT')
                return hs.wrong("Can't find input field with id '#input-task'")

            const addButton = document.getElementById("add-task-button")
            if (addButton === null || addButton.tagName !== 'BUTTON')
                return hs.wrong("Can't find button with id '#add-task-button'")

            const taskList = document.getElementById("task-list")
            if (taskList === null || taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            let currentTaskCounter = 1;

            for (let taskName of tasksName) {
                inputField.value = taskName
                addButton.click()

                const tasks = taskList.getElementsByTagName("li")

                if (tasks.length !== currentTaskCounter) {
                    return hs.wrong("After adding a task number of the <li> tags is not increased!")
                }

                currentTaskCounter++
            }

            return hs.correct()
        },

        // Test #4 - Check each task in task list
        () => {

            const taskList = document.getElementById("task-list")
            if (taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            const tasks = taskList.getElementsByTagName("li")
            if (tasks.length !== 5)
                return hs.wrong("Inside the <ul> tag should be 5 <li> elements after adding 5 tasks!")

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

        // Test #5 - Check completed task
        async () => {
            const taskList = document.getElementById("task-list")
            if (taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            let tasks = taskList.getElementsByTagName("li")

            for (let task of tasks) {
                const taskName = task.querySelector("span.task")

                if (taskName === null)
                    return hs.wrong("Inside each <li> tag should one <spane> tag with 'task' class")

                if (taskName.textContent === 'Third task') {
                    const checkbox = task.querySelector("input[type=checkbox]")
                    checkbox.click()
                    break;
                }
            }

            tasks = taskList.getElementsByTagName("li")

            for (let task of tasks) {

                const taskName = task.querySelector("span.task")

                if (taskName.textContent === 'Third task') {
                    let taskName = task.querySelector("span.task")
                    if (taskName === null)
                        return hs.wrong("Inside each <li> tag should be one <span> tag with 'task' class")

                    if (!taskName.style.textDecoration.includes("line-through") &&
                        !getComputedStyle(taskName).textDecoration.includes("line-through")) {
                        return hs.wrong("If checkbox is checked the task name should be crossed out.\n" +
                            "The span tag with task name should have 'text-decoration: line-trough' style")
                    }

                    return hs.correct()
                }
            }

            return hs.wrong("Can't find task with name 'Third task' after it was added!")
        }
    );

    if (result.type === 'wrong') {
        await browser.close();
        return result;
    }

    await page.goto(pagePath);

    result = await hs.testPage(page,

        // Test #6(1) - Test task list after reloading the page
        async () => {

            const taskList = document.getElementById("task-list")
            if (taskList.tagName !== 'UL')
                return hs.wrong("Can't find <ul> tag with id '#task-list'")

            const tasks = taskList.getElementsByTagName("li")

            if (tasks.length !== 5) {
                return hs.wrong("Looks like you didn't store the tasks in the local storage.\n" +
                    "After refreshing the page expected 5 tasks!")
            }

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
