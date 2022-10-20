function hallwayImageBlend() {
    function init(config){
        const {data, settings} = config;
        const rootCssValue = document.querySelector(':root');
        let count = 1;
        const classesObject = {
            "selected-image-1": "selected-image-1",
            "selected-image-2": "selected-image-2",
            "selected-image-3": "selected-image-3",
            "selected-image-4": "selected-image-4",
            "selected-image-5": "selected-image-5",
            "selected-image-6": "selected-image-6"
        };
        let classesPriorityQueue = [
            "selected-image-6",
            "selected-image-5",
            "selected-image-4",
            "selected-image-3",
            "selected-image-2",
            "selected-image-1"
        ];

        addDocumentStructure(settings);
        addEscapedValues(settings);
        createCategoryButtons(data);
        addCategoryButtonEventListeners();
        setDocumentEvents();

        const categoryCalculations = (function() {
            /* Used to determine:
                1. The image overlay text
                2. The height of the images within each 'category' of images, this is due to the possibility that different tissue categories
                 may have different sized images. Each tissue needs to have the same sized images otherwise it will look off. However,
                 each tissue category can have different sized images.
            */
            const countWithinEachCategory = {};
            const ratios = {};
            const widths = {};
            const categoryButtonOverlayKeys = {};
            let categoryCalculationsCount = 1;

            for (const item in data) {
                const itemKey = `button-number-${categoryCalculationsCount}`;
                categoryButtonOverlayKeys[itemKey] = item;
                countWithinEachCategory[itemKey] = Object.keys(data[item]).length;
                getImageDimensions(data[item], itemKey);
                categoryCalculationsCount++;
            }

            const getUpdateString = (key) => {
                return `${countWithinEachCategory[key]} protein targets on a single section of ${categoryButtonOverlayKeys[key].toLowerCase()}`;
            }

            // This function needs refactoring if data switches to the correct way
            function getImageDimensions(item, key) {
                const img = new Image();
                let imageDimensionsCount = 0;
                img.src = item[Object.keys(item)[imageDimensionsCount]].image;
                img.addEventListener('error', function handleError() {
                    imageDimensionsCount++;
                    img.src = item[Object.keys(item)[imageDimensionsCount]].image;
                })
                    img.onload = function () {
                    ratios[key] = this.height / this.width;
                    widths[key] = this.width;
                }
            }

            const getCurrentRatio = (key) => {
                return ratios[key];
            }
            const getCurrentWidth = (key) => {
                return widths[key];
            }
            return {getUpdateString, getCurrentRatio, getCurrentWidth}
        })();

        // Create buttons of both the categories and inputs
        function createButton(title, classesToAdd, counter = undefined) {
            const button = document.createElement('button');
            button.textContent = title;
            button.classList.add(...classesToAdd);
            if (counter !== undefined) {
                button.dataset.imgid = counter;
            }
            return button;
        }

        // Used to create the images
        function createImageContainer(image, classesToAdd, counter) {
            const containerDiv = document.createElement('div');
            containerDiv.classList.add(...classesToAdd);
            containerDiv.dataset.imgid = counter;

            // Error handling for if the image is invalid - the button will be disabled
            const mainImage = document.createElement('img');
            mainImage.addEventListener('error', function handleError() {
                document.querySelector(`#selection-button-container [data-imgid='${counter}']`).classList.add('disable');
            });
            try {mainImage.src = image} catch (e) {}

            containerDiv.appendChild(mainImage);
            return containerDiv;
        }

        // Create all tissue category buttons, and marker buttons within each
        function createCategoryButtons(data) {
            let first_iteration = true;
            let categoryIterationCount = 1;
            for (const key in data) {
                const classesToAdd = [`category-button`, `button-number-${categoryIterationCount}`, ...(first_iteration ? ["button-is-clicked"] : [])];

                // If no button name is provided, pass in the current incremental count
                document.getElementById('category-button-container').appendChild(
                    createButton((key.length === 0 ? categoryIterationCount : key), classesToAdd));

                createTissueMarkerButtons(data[key], `button-number-${categoryIterationCount}`);
                first_iteration = false;
                categoryIterationCount++;
            }
        }

        function createTissueMarkerButtons(keyValuePairs, additionalClasses) {
            for (const property in keyValuePairs) {
                let buttonClassesToAdd = [`click_button`, additionalClasses, 'hide'];

                if(keyValuePairs[property].preselect) {
                    buttonClassesToAdd.push('hw__blender__preselect');
                }

                // Create buttons
                document.getElementById('selection-button-container').appendChild(
                    createButton(property, buttonClassesToAdd, count)
                );

                // Create images
                document.getElementById('hallway-parent-image-container').appendChild(
                    createImageContainer(keyValuePairs[property].image, ["image-container"], count)
                );


                count++;
            }
        }

        function addRemoveClasses(classToAdd, classToRemove, nodeList) {
            const nodeListLength = nodeList.length;
            for (let i = 0; i < nodeListLength; i++) {
                if (classToAdd !== "") {
                    nodeList[i].classList.add(classToAdd);
                }
                if (classToRemove !== "") {
                    nodeList[i].classList.remove(classToRemove);
                }
            }
        }

        function sortByLast(array) {
            return array.sort((a, b) => b.charCodeAt(b.length - 1) - a.charCodeAt(a.length - 1));
        }

        function reset() {
            classesPriorityQueue = [
                "selected-image-6",
                "selected-image-5",
                "selected-image-4",
                "selected-image-3",
                "selected-image-2",
                "selected-image-1"];
            for (let i = 0; i < classesPriorityQueue.length; i++) {
                document.querySelectorAll(`.${classesPriorityQueue[i]}`).forEach(button => {
                    button.classList.remove(classesPriorityQueue[i]);
                })
            }
        }

        // Add the 3 category button listeners
        function addCategoryButtonEventListeners() {
            const buttonContainer = document.getElementById('selection-button-container');
            const categoryButtons = document.getElementsByClassName('category-button');
            const informationOverlay = document.getElementById("information-title");
            const categoryButtonsLength = categoryButtons.length;

            for (let i = 0; i < categoryButtonsLength; i++) {
                categoryButtons[i].addEventListener('click', () => {
                        const categoryClass = categoryButtons[i].classList[1];
                        informationOverlay.innerText = categoryCalculations.getUpdateString(categoryClass);
                        addRemoveClasses("", "button-is-clicked", categoryButtons);
                        categoryButtons[i].classList.add('button-is-clicked');

                        // Update CSS root value for differing category heights and widths
                        rootCssValue.style.setProperty('--height', `${categoryCalculations.getCurrentRatio(categoryClass) * 100}%`);
                        rootCssValue.style.setProperty('--max-width', `${categoryCalculations.getCurrentWidth(categoryClass)}px`);

                        // Buttons to display
                        addRemoveClasses("", "hide", buttonContainer.querySelectorAll(`.${categoryClass}`));

                        // Buttons to hide
                        addRemoveClasses("hide", "", buttonContainer.querySelectorAll(`:not(.${categoryClass})`));

                        // Reset the priority queue and enable buttons
                        reset();
                        enableButtons();

                        // Simulate clicks on buttons that are meant to be preselected
                        const preselectButtons = document.querySelectorAll(`.click_button.${categoryClass}.hw__blender__preselect`);
                        if(preselectButtons.length === 0) {
                            // select first button as default, since no preselected items exist
                            document.querySelector(`.click_button.${categoryClass}`).click();
                        } else {
                            preselectButtons.forEach((el,i) => {
                                // only preselect a max of 6 tissue markers
                                if(i < 6) {
                                    el.click();
                                }
                            });
                        }


                    }
                )
            }
        }

        function handleSelectionButtonClick(target) {
            const imageContainer = document.querySelector(`.image-container[data-imgid='${target.dataset.imgid}']`);
            const currentClasses = imageContainer.className.split(' ');

            // Check whether the target is already selected and if so, then remove the highlighting classes
            let addClass = true;
            for (const myClass of currentClasses) {
                if (classesObject[myClass]) {
                    addClass = false;

                    imageContainer.classList.remove(classesObject[myClass]);
                    target.classList.remove(classesObject[myClass]);

                    classesPriorityQueue.push(classesObject[myClass]);
                    classesPriorityQueue = sortByLast(classesPriorityQueue);
                }
            }
            // If the target does not contain a selected class and there is still availability for another selection, add the
            // next class highlighting class in line.
            if (addClass && classesPriorityQueue.length !== 0) {
                const tempClassToAdd = classesPriorityQueue.pop();
                imageContainer.classList.add(tempClassToAdd);
                target.classList.add(tempClassToAdd);
            }
            if (classesPriorityQueue.length !== 0) {
                enableButtons();
            } else {
                disableButtons();
            }
        }

        function disableButtons() {
            rootCssValue.style.setProperty('--cursor', `not-allowed`);
            rootCssValue.style.setProperty('--disabled-background', `#e2e2ea`);
        }

        function enableButtons() {
            rootCssValue.style.setProperty('--cursor', `auto`);
            rootCssValue.style.setProperty('--disabled-background', `white`);
        }

        function setDocumentEvents() {
            window.addEventListener('load', function () {
                document.querySelector('.category-button').click();
            })

            // Add one listener that listens for the specific classes and then runs the specific function.
            document.addEventListener('click', function (event) {
                if (event.target.matches('.click_button')) {
                    handleSelectionButtonClick(event.target);
                }
            }, false);
        }

        function addDocumentStructure(settings) {
            try {
                const rootElement = (settings.root_element_id.startsWith('#')
                    ? document.querySelector(settings.root_element_id)
                    : document.querySelector(`#${settings.root_element_id}`));
                rootElement.innerHTML = `
                    <div id="hallway-blender-root">
                        <div id="hallway-parent-image-container">
                            <div id="image-information-container">
                                <div id="hw-overlay-content">
                                    <span id="information-title"></span>
                                    <span id="information-content"></span>
                                    <span id="information-subtitle"></span>
                                </div>
                            </div>
                        </div>
                        <div id="button-container">
                            <div id="category-button-container"></div>
                            <div id="selection-button-container"></div>
                        </div>
                    </div>
                    `;
            } catch(e) {
                alert("Please enter a valid root element id");
            }
        }
        function addEscapedValues(settings) {
            const informationTitle = document.querySelector('#information-content');
            const informationSubtitle = document.querySelector('#information-subtitle');
            informationTitle.textContent = settings.string_title;
            informationSubtitle.textContent = settings.string_subtitle;
        }
    }
    return {init}
}