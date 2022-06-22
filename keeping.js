(() => {
    let counter = (function () {
        let counter = 0;
        return function () {return counter += 1;}
    })();


    const data = {

        // Button category 1
        "Tonsil Tissue": {
             "aSMA": "./assets/aSMA.jpg",
             "CD3": "./assets/CD3.jpg",
             "CD4": "./assets/CD4.jpg",
             "CD8": "./assets/CD8.jpg",
             "CD11b": "./assets/CD11b.jpg",
             "CD11c": "./assets/CD11c.jpg",
             "CD15": "./assets/CD15.jpg",
             "CD20": "./assets/CD20.jpg",
             "CD25": "./assets/CD25.jpg",
             "CD38": "./assets/CD38.jpg"
        },
        // EXAMPLE FILES
        "Example Tissue": {
             "CD3": "./examples/CD3.png",
             "CD4": "./examples/CD4.png",
             "CD8": "./examples/CD8.png",
             "CD20": "./examples/CD20.png",
             "CD68": "./examples/CD68.png",
             "CK": "./examples/CK.png",
             "DAPI": "./examples/DAPI.png",
             "FOXP3": "./examples/FOXP3.png",
             "Ki67": "./examples/Ki67.png",
             "PD-1": "./examples/PD-1.png",
             "PD-L1": "./examples/PD-L1.png"
        },

        // Button category 2
        "Lung Tissue": {
             "HLA-DR": "./assets/HLA-DR.jpg",
             "Ki67": "./assets/Ki67.jpg",
             "LAG3": "./assets/LAG3.jpg",
             "NaK-ATPase": "./assets/NaK-ATPase.jpg",
             "panCK": "./assets/panCK.jpg",
             "PD-1": "./assets/PD-1.jpg",
             "PD-L1": "./assets/PD-L1.jpg",
             "Vimentin": "./assets/Vimentin.jpg"
        },

        // // Button category 3
        // "Lymph Node": {
        //      "CD45": "./assets/CD45.jpg",
        //      "CD45RA": "./assets/CD45RA.jpg",
        //      "CD56": "./assets/CD56.jpg",
        //      "CD68": "./assets/CD68.jpg",
        //      "CD163": "./assets/CD163.jpg",
        //      "DAPI": "./assets/DAPI.jpg",
        //      "FOXP3": "./assets/FOXP3.jpg"
        // }
    }

    const classesObject = {
        "selected-image-1":"selected-image-1",
        "selected-image-2":"selected-image-2",
        "selected-image-3":"selected-image-3",
        "selected-image-4":"selected-image-4",
        "selected-image-5":"selected-image-5",
        "selected-image-6":"selected-image-6"
    }
    let classesPriorityQueue = [
        "selected-image-6",
        "selected-image-5",
        "selected-image-4",
        "selected-image-3",
        "selected-image-2",
        "selected-image-1"]

    /* Used to determine:
    1. The image overlay text
    2. The height of the images within each 'category' of images, this is due to the possibility that different tissue categories
     may have different sized images. Each tissue needs to have the same sized images otherwise it will look off. However,
     each tissue category can have different sized images.*/
    const categoryCalculations = (() => {
        const countWithinEachCategory = {}
        const ratios = {}
        const widths = {}

        for (const item in data) {
            countWithinEachCategory[item] = Object.keys(data[item]).length
            getImageDimensions(item)
        }
        const convertKey = (key) => {
            let temp = key.split('-')
            temp = temp.map(x => x.charAt(0).toUpperCase() + x.slice(1))
            temp = temp.join(' ')
            return temp
        }
        const getUpdateString = (key) => {
            const updatedKey = convertKey(key)
            return `${countWithinEachCategory[updatedKey]} markers on ${updatedKey.toLowerCase()}`
        }

        // This function needs refactoring if data switches to the correct way
        function getImageDimensions(item) {
            let img = new Image();
            img.src = Object.values(data[item])[0]
            img.onload = function() {
                ratios[item] = this.height / this.width
                widths[item] = this.width
            }
        }
        const getCurrentRatio = (key) => {
            return ratios[convertKey(key)]
        }
        const getCurrentWidth = (key) => {
            return widths[convertKey(key)]
        }
        return {getUpdateString, getCurrentRatio, getCurrentWidth}
    })();

    // Used to create the buttons of both the categories and inputs
    function createButton(title, classesToAdd, counter = undefined) {
        const button = document.createElement('button')
        button.textContent = title
        button.classList.add(...classesToAdd)
        if (counter !== undefined) {
            button.dataset.imgid = counter
        }
        return button
    }

    // Used to create the images
    function createImageContainer(image, classesToAdd, counter) {
        const containerDiv = document.createElement('div')
        containerDiv.classList.add(...classesToAdd)
        containerDiv.dataset.imgid = counter

        const mainImage = document.createElement('img')
        mainImage.src = image

        containerDiv.appendChild(mainImage)
        return containerDiv
    }

    // Tonsil Tissue, Lung Tissue and Lymph node buttons
    function createCategoryButtons(data) {
        let first_iteration = true
        for (let key in data) {
            const classesToAdd = [`category-button`, `${key.split(" ").join("-").toLowerCase()}`, (first_iteration && ["button-is-clicked"])]
            document.getElementById('category-button-container').appendChild(
                createButton(key, classesToAdd))
            setUp(data[key], key.split(" ").join("-").toLowerCase(), first_iteration)
            first_iteration = false
        }
    }


    function setUp(keyValuePairs, additionalClasses, first_iteration){
        for (const property in keyValuePairs){
            const count = counter()

            let buttonClassesToAdd
            if (first_iteration) {
                buttonClassesToAdd = [`click_button`,`${additionalClasses}`]
            } else {
                buttonClassesToAdd = [`click_button`,`${additionalClasses}`, 'hide']
            }

            // Create images
            document.getElementById('parent-image-container').appendChild(
                createImageContainer(keyValuePairs[property], ["image-container"], count)
            )

            // Create buttons
            document.getElementById('selection-button-container').appendChild(
                createButton(property, buttonClassesToAdd, count))
        }
    }


    function addRemoveClasses(classToAdd, classToRemove, nodeList) {
        for (let i = 0; i < nodeList.length; i++) {
            if (classToAdd !== "") {
                nodeList[i].classList.add(classToAdd)
            }
            if (classToRemove !== "") {
                nodeList[i].classList.remove(classToRemove)
            }
        }
    }

    function sortByLast(array){
        return array.sort((a, b) => b.charCodeAt(b.length - 1) - a.charCodeAt(a.length - 1));
    }

    function reset() {
        classesPriorityQueue = [
            "selected-image-6",
            "selected-image-5",
            "selected-image-4",
            "selected-image-3",
            "selected-image-2",
            "selected-image-1"]
        for (let i = 0; i < classesPriorityQueue.length; i++){
            document.querySelectorAll(`.${classesPriorityQueue[i]}`).forEach(button => {button.classList.remove(classesPriorityQueue[i])})
        }
    }


    // Add the 3 category button listeners
    function addCategoryButtonEventListeners() {
        const buttonContainer = document.getElementById('selection-button-container')
        const categoryButtons = document.getElementsByClassName('category-button')
        const informationOverlay = document.getElementById("information-content")
        const rootCssValue = document.querySelector(':root')

        for (let i = 0; i < categoryButtons.length; i++) {
            categoryButtons[i].addEventListener('click', () => {
                const categoryClass = categoryButtons[i].classList[1];
                informationOverlay.innerText = categoryCalculations.getUpdateString(categoryClass)
                addRemoveClasses("", "button-is-clicked", categoryButtons)
                categoryButtons[i].classList.add('button-is-clicked')

                // Update CSS root value for differing category heights and widths
                rootCssValue.style.setProperty('--height', `${categoryCalculations.getCurrentRatio(categoryClass)*100}%`);
                rootCssValue.style.setProperty('--max-width', `${categoryCalculations.getCurrentWidth(categoryClass)}px`);

                // Buttons to display
                addRemoveClasses("", "hide", buttonContainer.querySelectorAll(`.${categoryClass}`))

                // Buttons to hide
                addRemoveClasses("hide", "", buttonContainer.querySelectorAll(`:not(.${categoryClass})`))

                // Reset the priority queue
                reset()
                }
            )
        }
    }

    function addSelectionButtonEventListeners(target) {
        const imageContainer = document.querySelector(`.image-container[data-imgid='${target.dataset.imgid}']`)
        const currentClasses = imageContainer.className.split(' ')

        // Check whether the target is already selected and if so, then remove the highlighting classes
        let addClass = true
        for (const myClass of currentClasses) {
            if (classesObject[myClass]) {
                addClass = false

                imageContainer.classList.remove(classesObject[myClass])
                target.classList.remove(classesObject[myClass])

                classesPriorityQueue.push(classesObject[myClass])
                classesPriorityQueue = sortByLast(classesPriorityQueue)
            }
        }
        // If the target does not contain a selected class and there is still availability for another selection, add the
        // next class highlighting class in line.
        if (addClass && classesPriorityQueue.length !== 0){
            const tempClassToAdd = classesPriorityQueue.pop()
            imageContainer.classList.add(tempClassToAdd)
            target.classList.add(tempClassToAdd)
        }
    }

    function setDocumentEvents() {
        window.addEventListener('load', function () {
            document.querySelector('.category-button').click()
        })

        // Rather than adding 50 event listeners for the individual buttons, add one listener that listens for the specific
        // classes and then runs the specific function.
        document.addEventListener('click', function (event) {
            if (event.target.matches('.click_button')) {
                addSelectionButtonEventListeners(event.target)
            }
        }, false);
    }

    (function init() {
        createCategoryButtons(data)
        addCategoryButtonEventListeners()
        setDocumentEvents()
    })();
})();
