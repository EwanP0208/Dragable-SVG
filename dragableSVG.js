//Followed guide at https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function makeDraggable(evt) {
    const SVG = evt.target;
    let selectedElement, offset, transform;

    //Boundary to confine any elements with the confine class to
    let boundaryX1 = 10.5;
    let boundaryX2 = 30;
    let boundaryY1 = 2.2;
    let boundaryY2 = 19.2;

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
        const isConfined = selectedElement.classList.contains('confine');
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
            
            //Updated the selected transform position minus the offset
            transform.setTranslate(position.x - offset.x, position.y - offset.y)
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