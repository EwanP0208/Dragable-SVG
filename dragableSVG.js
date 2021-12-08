const SVGNS = "http://www.w3.org/2000/svg"
const CELL_WIDTH = 0.5;

//Followed guide at https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function makeDraggable(evt) {
    const SVG = evt.target;
    let selectedElement, offset, transform;

    //Used with element size to fix dragging to boundary
    let elementBounds = {};

    //Boundary to confine all elements to
    let boundary = {
        x1: 1, x2: 29,
        y1: 1, y2: 19
    }

    //Add the boundary element
    const boundaryElement = createBoundaryElement(boundary);

    //First child will be the background
    SVG.insertBefore(boundaryElement, SVG.children[1]);

    //Add grid lines that elements will snap to
    addGridLines(SVG, CELL_WIDTH);

    //Bindings for mouse
    SVG.addEventListener('mousedown', startDrag);
    SVG.addEventListener('mousemove', drag);
    SVG.addEventListener('mouseup', endDrag);
    SVG.addEventListener('mouseleave', endDrag);

    //Bindings for touch
    SVG.addEventListener('touchstart', startDrag);
    SVG.addEventListener('touchmove', drag);
    SVG.addEventListener('touchend', endDrag);
    SVG.addEventListener('touchleave', endDrag);
    SVG.addEventListener('touchcancel', endDrag);

    //Not all elements have x and y attributes, if the first transform is not a translation
    //or it doesnt have one then we make one
    function startDrag(evt) {
        //Check if the clicked on element is actually draggable
        if (evt.target.classList.contains('draggable')) {
            selectedElement = evt.target;

            //If the selected target has a parent then make that the selected element
            while (selectedElement.parentNode.nodeName !== 'svg') {
                selectedElement = selectedElement.parentNode;
            }

            //Get all the transforms currently on this element
            let transforms = selectedElement.transform.baseVal;

            //Ensure that the first transform is a translate transform
            if (transforms.length === 0 || transforms.getItem(0).type != SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                //Create a transform that can translate by (0, 0)
                let translate = SVG.createSVGTransform();
                translate.setTranslate(0, 0);

                //Add the translation to the front of the transforms list
                selectedElement.transform.baseVal.insertItemBefore(translate, 0);
            }

            //Calculate the possible coordinates for the element in the boundary
            let bbox = selectedElement.getBBox();
            elementBounds = calculateBounds(bbox, boundary)

            //Get the starting translation amount
            transform = transforms.getItem(0);

            //Get the starting offset amount
            offset = getMousePosition(evt);
            offset.x -= transform.matrix.e;
            offset.y -= transform.matrix.f;
        }
    }

    function drag(evt) {
        if (selectedElement) {
            //Prevent other dragging behaviour such as highlighting text
            evt.preventDefault();

            let position = getMousePosition(evt);

            //Rounded to the nearest 0.5
            let dx = roundHalf(position.x - offset.x);
            let dy = roundHalf(position.y - offset.y);
            
            if (dx < elementBounds.minX) { dx = elementBounds.minX; }
            if (dx > elementBounds.maxX) { dx = elementBounds.maxX; }
            if (dy < elementBounds.minY) { dy = elementBounds.minY; }
            if (dy > elementBounds.maxY) { dy = elementBounds.maxY; }

            //Updated the selected transform position minus the offset
            transform.setTranslate(dx, dy)
        }
    }

    function endDrag(evt) {
        selectedElement = null;
    }


    //ClientX and ClientY give the position using the screen coordinate system
    //whereas we want them in relation to the SVG space (which in this example
    //is 30 x 20)
    function getMousePosition(evt) {
        //Need the Current Transform Matrix to convert the coordinates properly
        let CTM = SVG.getScreenCTM();

        //There can be multiple touches so we only want the first
        if (evt.touches) { evt = evt.touches[0]; }

        //Below expression will convert screen coordinates to SVG space
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        }
    }
}

function roundHalf(num) {
    const multiplier = 1 / CELL_WIDTH;
    return Math.round(num * multiplier) / multiplier
}

function calculateBounds(bbox, boundary) {
    return {
        minX: boundary.x1 - bbox.x,
        maxX: boundary.x2 - bbox.x - bbox.width,
        minY: boundary.y1 - bbox.y,
        maxY: boundary.y2 - bbox.y - bbox.height
    }
}

function createBoundaryElement(boundary) {
    const offsetAmount = CELL_WIDTH / 2;
    const {x1, x2, y1, y2} = offsetBoundaryPath(boundary, offsetAmount)

    //Start TL, go to TR, then BR, then BL and back to TL
    const pathCommand = `M${x1} ${y1} H${x2} V${y2} H${x1} Z`

    let newPath = document.createElementNS(SVGNS, "path");
    newPath.setAttribute("d", pathCommand);
    newPath.setAttribute("stroke", "black");
    newPath.setAttribute("stroke-width", CELL_WIDTH);
    newPath.setAttribute("fill", "none");

    return newPath;
}

function offsetBoundaryPath({x1, x2, y1, y2}, offsetAmount) {
    return {
        x1: x1 - offsetAmount,
        y1: y1 - offsetAmount,
        x2: x2 + offsetAmount,
        y2: y2 + offsetAmount
    }
}

function addGridLines(svg, cellSize) {
    const newGridLine = (start, direction, length) => {
        let pathCommand = "";

        if (direction === "horizontal") {
            pathCommand = `M0 ${start} L${length} ${start}`
        }

        if (direction === "vertical") {
            pathCommand = `M${start} 0 L${start} ${length}`
        }

        let newPath = document.createElementNS(SVGNS, "path");
        newPath.setAttribute("d", pathCommand);
        newPath.setAttribute("stroke", "#BBB");
        newPath.setAttribute("stroke-width", 0.0075);

        return newPath;
    }
    
    const { width, height } = svg.viewBox.baseVal;
    let gridGroup = document.createElementNS(SVGNS, "g");

    for (let i = cellSize; i < width; i += cellSize) {
        gridGroup.appendChild(newGridLine(i, "vertical", height));
    }

    for (let j = cellSize; j < height; j += cellSize) {
        gridGroup.appendChild(newGridLine(j, "horizontal", width));
    }

    svg.insertBefore(gridGroup, svg.children[1]);
}