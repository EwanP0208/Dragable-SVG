//Followed guide at https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
function makeDraggable(evt) {
    const SVG = evt.target;
    let selectedElement = false;

    //Bindings for mouse
    SVG.addEventListener('mousedown', startDrag);
    SVG.addEventListener('mousemove', drag);
    SVG.addEventListener('mouseup', endDrag);
    SVG.addEventListener('mouseleave', endDrag);

    //Bindings for touch

    function startDrag(evt) {
        //Check if the clicked on element is actually draggable
        if (evt.target.classList.contains('draggable')) {
            selectedElement = evt.target;
        }
    }

    function drag(evt) {
        if (selectedElement) {
            //Prevent other dragging behaviour such as highlighting text
            evt.preventDefault();

            //Have to use getAttributeNS and setAttributeNS when working with SVG elements
            let x = +(selectedElement.getAttributeNS(null, "x"));
            selectedElement.setAttributeNS(null, "x", x + 0.1);
        }
    }

    function endDrag(evt) {
        selectedElement = null;
    }
}