//#region TEMPLATES

const addForm = `<div class="addingCard"> 
                    <div class="card addCardForm"> 
                        <input type="text" placeholder="Type a title"> 
                    </div> 
                    
                    <div style="display: flex;"> 
                        <div class="addButton card">Add</div> 
                        <div class="cancelCard card">Cancel</div> 
                    </div> 
                </div>`;

const addCardButton = `<div class="addCard add">Add card +</div>`;

const fullAddList = `   <div class="addList list">
                            <p class="listTitle add"><b class="add">Add list +</b></p>            
                        </div>`;

const addListButton = `<p class="listTitle add"><b class="add">Add list +</b></p>`;

const createNewLabel = `<div class="addUserLabel userLabel">Create label</div>`
const newLabelKit = `<div class="addingUserLabelKit userLabel">
                        <input type="text" class="newLabelName" placeholder="Type a name" onfocus = "this.select()">
                        <p>Pick a color</p>

                        <div class="colorContanier">  
                            
                        </div>
                        <div class="colorContanier">  
                            
                        </div>

                        <div class="options">
                            <div class="createLabelButton">Create</div>
                            <div class="cancelLabelButton">Cancel</div>
                        </div>
                    </div>`
//#endregion

let lists = (localStorage.getItem('lists') == null ) ?  new Array : JSON.parse(localStorage.getItem('lists'));
let labels = (localStorage.getItem('labels') == null ) ?  new Array : JSON.parse(localStorage.getItem('labels'));

const colors = ['#C04CFD', '#E05263', '#FFED66', '#E98A15', '#324A5F', '#78FECF', '#69B578', '#FF5A5F'];
const dueDateColors = []

function displayLocalStorage(){
    let listContainer = document.querySelector('.listContainer');
    listContainer.innerHTML = "<div class='li'></div>";
    let listContainerChild = listContainer.querySelector('.li');

    for(i = 0; i < lists.length; i++){
        let name = lists[i].name;
        let cards = lists[i].cards;
        let labelId = lists[i].id;

        listContainerChild.innerHTML += `<div class = "list" data-listid = ${labelId}>
                                        <input type= "text" class = "listTitle" value = "${name}" onfocus="this.select()" onchange="editListName()"/>
                                        <i class="fas fa-ellipsis-h listDots" data-listid = ${labelId}></i>
                                        <div class= "listOptions" data-listid = ${labelId}>
                                            <div class = "lOptions" data-listid = ${labelId}>Sort by Due date</div>
                                            <div class = "lOptions" style = "margin: 2.5% auto" data-listid = ${labelId}>Sort by Name</div>
                                            <div class = "lOptions" style = "margin-bottom: 2.5%" data-listid = ${labelId}>Empty List</div>
                                            <div class = "lOptions" data-listid = ${labelId}>Delete</div>                                        
                                        </div>
                                        <div class = "cardContainer" data-listid = ${labelId}></div>
                                    </div>`

        let list = listContainer.querySelector(`[data-listid = "${labelId}"]`);  

        for(x = 0; x < cards.length; x++){
            let name = cards[x].name;
            let cardLabels = cards[x].labels;
            let cardId = cards[x].cardId
            let realDate = cards[x].dueDate;
            let time = (cards[x].dueTime) ? cards[x].dueTime : "";            
            let momentDate = moment(realDate + " " + time);
            let stringDate = (momentDate.format("YYYY") == moment().format("YYYY")) ? momentDate.format("MMM D") : momentDate.format("MMM D, YYYY");
            let validDate = (stringDate != "Invalid date");
            let done = (cards[x].checked) ? cards[x].checked : false;

            list.querySelector('.cardContainer').innerHTML += `<div class="card" data-cardid = "${cardId}" data-listid = "${labelId}">
                                    <div class = "colors"></div>
                                    <p class="cardTitle">${name}</p>
                                    <div class = "due" style = "display: ${(validDate) ?"inline-block":"none"}" data-date = "${realDate + " ".concat(time)}" data-done = "${done}"><i class="far fa-clock" style = "margin-right: 5px;"></i>${(validDate) ? stringDate : ""}</div>
                                </div>`;
            
            let card = list.querySelector(`[data-cardid = "${cardId}"]`);

            let colorContainer = card.querySelector(".colors");
            for(y = 0; y < labels.length; y++){
                colorContainer.innerHTML += `<div class="color" style = "background-color: ${labels[y].color};" data-labelid = "${labels[y].id}"></div>`
            }

            for(y = 0; y < cardLabels.length; y++){
                colorContainer.querySelector(`[data-labelid = "${cardLabels[y].id}"]`).style.display = 'block'
            }
        }

        list.innerHTML += addCardButton;
    }

    listContainer.innerHTML += fullAddList;

    let allCards = document.querySelectorAll('.card');    
    for(v = 0; v < allCards.length; v++){
        allCards[v].addEventListener('click', displayEditCard);
    }

    let cardLabels = document.querySelector('.labelContainer');
    let children = cardLabels.querySelectorAll('.label');
    if(children != null){
        for(i = 0; i < children.length; i++){
            children[i].remove();
        }
    }
    
    for(z = 0; z < labels.length; z++){
        cardLabels.innerHTML += `<div class = "label" style = "background-color: ${labels[z].color}" data-labelid = "${labels[z].id}">${labels[z].name}</div>`;
    }

    let allListX = document.querySelectorAll('.listDots')
    for(const x of allListX){
        x.addEventListener('click', displayListOptions);
    }    
    
    displayLocalStorageLabels();

    let allCardContainer = document.querySelectorAll('.cardContainer')
    for(const cc of allCardContainer){
        Sortable.create(cc, {
            animation: 150,
            chosenClass: 'chosen',
            dragClass: 'drag',
            group:{name: 'cards'},

            onEnd: (e) =>{
                let newParent = e.to;
                let children = e.to.children;
                let c = e.item;
                let newList = getList(newParent.dataset.listid);      
                let cards = newList.cards;

                if(cards.length > 0){
                    let oldList = getList(c.dataset.listid);
                    let oldCard = getCard(oldList, c.dataset.cardid);
                    let oldIPos = oldList.cards.indexOf(oldCard);

                    oldCard.listId = newParent.dataset.listid;
                    oldCard.cardId = getBigCardId(cards) + 1;

                    c.dataset.listid = oldCard.listId;
                    c.dataset.cardid = oldCard.cardId;

                    oldList.cards.splice(oldIPos, 1);
                    newList.cards.push(oldCard);

                    for(i = 0; i < cards.length; i++){
                        let cardHTML = getCard(newList, children[i].dataset.cardid);
                        if(cards[i].cardId != cardHTML.cardId){
                            let index = cards.indexOf(cardHTML);
                            let temp = cards[i];
                            
                            cards[i] = cards[index];
                            cards[index] = temp;
                        }
                    }
                }
                else{
                    let oldList = getList(c.dataset.listid);
                    let card = getCard(oldList, c.dataset.cardid);
                    let index = oldList.cards.indexOf(card);

                    oldList.cards.splice(index, 1);
                    card.listId = newParent.dataset.listid;
                    newList.cards.push(card);
                }

                updateLocalStorage();
                displayLocalStorage();
            }
        })
    }

    listContainerChild = listContainer.querySelector('.li');
    Sortable.create(listContainerChild, {
        animation: 150,
        chosenClass: 'chosen',
        dragClass: 'drag',
        ghostClass: 'ghost',
        group:{name: 'lists'},
        filter: ".listDots, .listOptions, .cancelCard, .addCard, .addButton",

        onEnd: (e) =>{
            let children = document.querySelectorAll('.li .list')
            for(i = 0; i < lists.length; i++){
                let listHTML = getList(children[i].dataset.listid);
                if(listHTML.id != lists[i].id){
                    let index = lists.indexOf(listHTML);
                    lists[index] = lists[i];
                    lists[i] = listHTML;
                }
            }

            updateLocalStorage();
            displayLocalStorage();
        }
    })

    changeDueDateColor();
    hideListOptions();
}

function getBigCardId(cards){
    let bigC = null;
    for(const c of cards){
        if(bigC == null) bigC = c;

        bigC = (bigC.cardId > c.cardId) ? bigC : c;
    }

    return bigC.cardId;
}

function getBigListId(){
    let bigL = null;
    for(const l of lists){
        if(bigL == null) bigL = l;

        bigL = (bigL.id > l.id) ? bigL : l;
    }

    return (bigL == null) ? -1 : bigL.id;
}

document.addEventListener('click', function(e){
    let targetClass = e.target.getAttribute('class');
    if(targetClass != null){
        targetClass = targetClass.split(" ")
        
        if(targetClass.includes('add')){
            
            
            let parent = e.target.parentElement;
            
            while(true){
                let parentClass = parent.getAttribute('class').split(' ');
                if(parentClass.includes('list')) break;
                
                parent = parent.parentElement;
                //listContainer.innerHTML += addListButton;
            }
            
            e.target.remove();
            parent.innerHTML += addForm;
            
            let addingCard = parent.querySelector('.addingCard').children[1];
            addingCard.children[0].addEventListener('click', addCard);
            addingCard.children[1].addEventListener('click', cancelAdd);
        }
    }
});

function updateLocalStorage(){
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('labels', JSON.stringify(labels));
}

function cancelAdd(){
    let parent = this.parentElement;
    while(true){
        let parentClass = parent.getAttribute('class');
        if(parentClass != null && parentClass.split(' ').includes('list')) break;
        
        parent = parent.parentElement;
    }
    
    parent.querySelector('.addingCard').remove();
    parent.innerHTML += (parent.getAttribute('class').includes('addList')) ? addListButton : addCardButton;

    let allCards = document.querySelectorAll('.card');

    for(i = 0; i < allCards.length; i++){
        allCards[i].addEventListener('click', displayEditCard);
    }
}

function addCard(){
    let parent = this.parentElement;
    while(true){
        let parentClass = parent.getAttribute('class');
        if(parentClass != null && parentClass.split(' ').includes('list')) break;
        
        parent = parent.parentElement;
    }
    
    let name = this.parentElement.parentElement.querySelector('input').value;
    let code;
    
    //Add list
    if(parent.getAttribute('class').includes('addList')){
        let listId = getBigListId() + 1;
        code = `<input type= "text" class = "listTitle" value = "${name}" onfocus="this.select()" onchange="editListName()"/> 
                <i class="fas fa-ellipsis-h listDots" data-listid = "${listId}"></i>          
                <div class= "listOptions">
                    <div class = "lOptions" data-listid = "${listId}">Sort by Due date</div>
                    <div class = "lOptions" style = "margin: 2.5% auto" data-listid = "${listId}">Sort by Name</div>
                    <div class = "lOptions" data-listid = "${listId}">Delete</div>
                </div>
                <div class= "cardContainer"></div>
                <div class="addCard add">Add card +</div>`
        
        parent.setAttribute('class', 'list')
        parent.setAttribute('data-listid', listId)
        parent.innerHTML = code;
        
        document.querySelector('.listContainer').innerHTML += fullAddList;
        
        lists.push({
            name: name,
            cards: new Array(),       
            id: getBigListId() + 1,     
        })

        updateLocalStorage()
        displayLocalStorage()
    }
    
    //Add card
    else{
        let listId = parseInt(parent.getAttribute('data-listid'));
        let list = getList(listId)
        let cardId = (list.cards.length == 0) ? 0 : getBigCardId(list.cards) + 1;
        
        code = `<div class="card" data-cardId = "${cardId}" data-listid = "${listId}">
                    <div class = "colors"></div>
                    <p class="cardTitle">${name}</p>
                    <div class = "due"><i class="far fa-clock" style = "margin-right: 5px;"></div>
                </div>`;
        
        parent.removeChild(this.parentElement.parentElement);
        parent.querySelector('.cardContainer').innerHTML += code;
        parent.innerHTML += addCardButton;
        
        list.cards.push({
            labels: new Array(),
            name: name,
            dueDate: "",
            listId: listId,
            cardId: cardId,
            checked: false,
        })      


        let card = parent.querySelector(`[data-cardid = "${cardId}"]`)
        let due = card.children[2]
        let colorContainer = card.querySelector(".colors");
        for(i = 0; i < labels.length; i++){
            colorContainer.innerHTML += `<div class="color" style = "background-color: ${labels[i].color}" data-labelid = "${labels[i].id}"></div>`
        }
        
        labelEvents();
    }  
    
    let allCards = document.querySelectorAll('.card');

    for(i = 0; i < allCards.length; i++){
        allCards[i].addEventListener('click', displayEditCard);
    }

    let allListX = document.querySelectorAll('.listDots')
    for(const x of allListX){
        x.addEventListener('click', deleteList);
    }

    updateLocalStorage();
    displayLocalStorage();
}

function getList(listId){
    for(const l of lists){
        if(l.id == listId) return l;
    }
}

function getCard(list, cardId){
    for(const c of list.cards){
        if(c.cardId == cardId) return c;
    }
}

function displayEditCard() {
    let bc = document.querySelector(".popUpBack");
    bc.style.display = "flex";
    bc.addEventListener('click', hideEditCard);

    let editWindow = document.querySelector('.editCard');
    let list = getList(this.dataset.listid)
    let cardInfo = getCard(list, this.dataset.cardid);
    let input = editWindow.querySelector('input');
    let date = editWindow.querySelector('.edits input[type= "date"]');
    let time = editWindow.querySelector(".edits input[type= 'time']");
    let from = editWindow.querySelector(".edits .from");  
    let check = editWindow.querySelector("#check i");
    let remDate = editWindow.querySelector(".remDate");
    
    input.value = cardInfo.name;    
    date.value = cardInfo.dueDate;
    time.value = (cardInfo.dueTime) ? cardInfo.dueTime : "";
    input.setAttribute('data-cardid', cardInfo.cardId);
    input.setAttribute('data-listid', cardInfo.listId);
    check.style.color = cardInfo.checked ? "#979797" : "#00000000";
    check.addEventListener("click", markAsDone);
    check.setAttribute('data-cardid', cardInfo.cardId);
    check.setAttribute('data-listid', cardInfo.listId);
    check.setAttribute('data-checked', (cardInfo.checked) ? cardInfo.checked: false);
    
    if(date.value != "") displayTimeLeft(moment(date.value + " " + time.value), from, (cardInfo.checked) ? cardInfo.checked : false);
    checkValidDate(date);

    let cardX = editWindow.querySelector('.cardX');
    cardX.setAttribute('data-cardid', cardInfo.cardId);
    cardX.setAttribute('data-listid', cardInfo.listId);
    cardX.addEventListener('click', deleteCard);
    remDate.addEventListener('click', removeDate);

    let colors = cardInfo.labels;    
    for(i = 0; i < colors.length; i++){
        editWindow.querySelector(`[data-labelid = "${colors[i].id}"]`).style.display = 'block';
    }

    editWindow.querySelector('.addLabel').addEventListener('click', displayEditLabels);
}

function displayTimeLeft(due, from, done){
    let timeLeft = due.fromNow();
    from.innerHTML = timeLeft;
    
    if(done){
        from.style.backgroundColor = "#69b578";
        from.style.color = "white";
    }
    else if(timeLeft.includes("ago")){
        from.style.backgroundColor = "#e05263";
        from.style.color = "white";
    }
    else if(timeLeft.includes("hours") || timeLeft.includes("hour") || timeLeft == "in a day"){
        from.style.backgroundColor = "#ffe736"
        from.style.color = "white";
    }
    else{
        from.style.backgroundColor = "#ffffff00";
        from.style.color = "grey";
    }
}

function hideEditCard(){
    document.querySelector('.popUpBack').style.display = "none";
    document.querySelector('.labelEdit').style.display = "none";

    let input = document.querySelector(".editCardTitle input");
    let time = document.querySelector(".editCard .edits input[type='time']");
    let date = document.querySelector(".editCard .edits input[type='date']");
    let realDate = date.value;
    let momentDate = moment(realDate + " " + time.value);
    let dateString = (momentDate.format("YYYY") == moment().format("YYYY")) ? momentDate.format("MMM D") : momentDate.format("MMM D, YYYY");
    let list = document.querySelector(`[data-listid = "${input.dataset.listid}"]`)
    let cardHTML = list.querySelector(`[data-cardid = "${input.dataset.cardid}"]`)
    let cardInfo = getCard(getList(list.dataset.listid), input.dataset.cardid);

    cardHTML.querySelector('.cardTitle').innerHTML = input.value;
    let dateHTML = cardHTML.querySelector('.due')
    dateHTML.innerHTML = `<i class="far fa-clock" style = "margin-right: 5px;"></i>` + ((dateString == "Invalid date") ? "" : dateString);
    dateHTML.style.display = (dateString == "Invalid date") ? "none" : "inline-block";
    dateHTML.dataset.date = realDate + " " + time.value;

    cardInfo.name = input.value;
    cardInfo.dueDate = realDate;
    cardInfo.dueTime = time.value;

    let allLabels = document.querySelectorAll('.label');
    for(i = 0; i < allLabels.length; i++){
        allLabels[i].style.display = 'none';
    }

    updateLocalStorage();
    changeDueDateColor();
}

function displayLabelKit(){
    let parent = this.parentElement;
    this.remove();
    parent.innerHTML += newLabelKit;
    displayColors();

    let kit = parent.lastChild;
    kit.querySelector('.createLabelButton').addEventListener('click', addNewLabel);
    kit.querySelector('.cancelLabelButton').addEventListener('click', cancelNewLabel);
    labelEvents();
}

function addNewLabel(){
    let parent = this.parentElement.parentElement;
    let name = parent.querySelector("input").value;
    let colorE= parent.querySelector("[data-selected = true]")
    
    if(name != "" && colorE != null){
        let labelList = parent.parentElement;
        let c = colorE.style.backgroundColor;
        let labelID = (labels.length == 0) ? 0 : labels[labels.length - 1].id + 1;

        parent.remove();
        labelList.innerHTML += `<div class="userLabel" style = "background-color: ${c}" data-labelid = "${labelID}">
                                    ${name}
                                    <div class= "userLabelX"><i class="fas fa-check"></i></div>
                                </div>
                                <div class="editUserLabel" data-labelid = "${labelID}"><i class="fas fa-pencil-alt" style = "font-size: 1rem; color: #979797;"></i></div>` + createNewLabel;
        labelList.querySelector('.addUserLabel').addEventListener('click', displayLabelKit);

        labels.push({
            name: name,
            color: c,
            id: labelID,
        })

        labelList.querySelector(`[data-labelid = "${labelID}"]`).addEventListener('click', addLabelToCard);
        
        document.querySelector('.labelContainer').innerHTML += `<div class = "label" style = "background-color: ${c}" data-labelid = "${labelID}">${name}</div>`;       

        let newLabel = `<div class="color" style = "background-color: ${c}" data-labelid = "${labelID}"></div>`;

        addLabelToAllCards(newLabel);
        updateLocalStorage();
        labelEvents(); 
    }
}

function addLabelToAllCards(label){
    let colorContainers = document.querySelectorAll('.colors');

    for(i = 0; i < colorContainers.length; i++){
        colorContainers[i].innerHTML += label;           
     }
}

function cancelNewLabel(){
    let kit = this.parentElement.parentElement;
    let labelList = kit.parentElement;

    kit.remove();
    labelList.innerHTML += createNewLabel;

    labelList.querySelector('.addUserLabel').addEventListener("click", displayLabelKit);
    labelEvents();
}

function selectColor(){
    this.dataset.selected = true;
    this.lastChild.style.display = 'inline-block';
    let c = document.querySelectorAll('.labelColors');

    for(i = 0; i < c.length; i++){
        if(c[i] != this){
            c[i].dataset.selected = false;
            c[i].lastChild.style.display = 'none';
        }
    }
}

function displayColors(){
    let colorContainer = document.querySelectorAll(".colorContanier");

    for(i = 0; i < colors.length; i++){
        let code = `<div class="labelColors" style = "background-color: ${colors[i]}" data-selected = "false"><i class="fas fa-check" style = "display: none"></i></div>`

        if(i > 3) colorContainer[1].innerHTML += code;
        else colorContainer[0].innerHTML += code;
    }

    let c = document.querySelectorAll('.labelColors');

    for(const color of c){
        color.addEventListener('click', selectColor);
    }
}

function displayEditLabels(){
    let editWindow = document.querySelector(".labelEdit");    
    editWindow.style.display = 'block';    
    editWindow.querySelector('.addUserLabel').addEventListener('click', displayLabelKit);

    displayLocalStorageLabels();

    let input = this.parentElement.parentElement.parentElement.querySelector('input');
    let listId = input.dataset.listid;
    let cardId = input.dataset.cardid;
    let list = getList(listId);
    let labels = getCard(list, cardId).labels;
    let userLabels = document.querySelectorAll('.userLabel');


    displayCheckOnLabels(labels, userLabels);
}

function displayCheckOnLabels(labels, userLabels){
    for (const userLabel of userLabels) {
        for(const label of labels){
            if(label.id == userLabel.dataset.labelid){
                userLabel.querySelector('.userLabelX').style.display = 'inline';
            }            
        }
    }
}

function displayLocalStorageLabels(){
    let labelContainer = document.querySelector('.userLabelContainer');
    labelContainer.innerHTML = "";

    for(i = 0; i < labels.length; i++){
        labelContainer.innerHTML += `<div class="userLabel" style = "background-color: ${labels[i].color}" data-labelid = "${labels[i].id}">
                                        ${labels[i].name}
                                        <div class= "userLabelX"><i class="fas fa-check"></i></div>
                                    </div>
                                    <div class="editUserLabel" data-labelid = "${labels[i].id}"><i class="fas fa-pencil-alt" style = "font-size: 1rem; color: #979797;"></i></div>`;        
    }

    labelContainer.innerHTML += createNewLabel;
    labelContainer.querySelector(".addUserLabel").addEventListener("click", displayLabelKit);
    labelEvents();
}

function labelEvents(){
    let labelContainer = document.querySelector('.userLabelContainer');
    for(i = 0; i < labels.length; i++){
        labelContainer.querySelector(`[data-labelid = "${labels[i].id}"]`).addEventListener('click', addLabelToCard);
        labelContainer.querySelector(`[data-labelid = "${labels[i].id}"].editUserLabel`).addEventListener('click', editUserLabel);
    }
}

function getLabelInfo(id){
    for(const l of labels){
        if(l.id == id) return l;
    }
}

function addLabelToCard(){
    let editWindow = document.querySelector(".editCard");
    let labelContainer = editWindow.querySelector(".labelContainer");
    let labelInfo = getLabelInfo(this.dataset.labelid);
    let input = editWindow.querySelector("input");
    let cardId = input.dataset.cardid;
    let listId = input.dataset.listid;

    let cardLabels = getCard(getList(listId), cardId).labels;
    let contains = false;

    for(i = 0; i < cardLabels.length; i++){
        if(labelInfo.id == cardLabels[i].id){
            contains = true;
            break;
        }
    }

    if(contains == false){
        labelContainer.querySelector(`[data-labelid = "${labelInfo.id}"]`).style.display = 'block';

        getCard(getList(listId), cardId).labels.push(labelInfo);
        let list = document.querySelector(`[data-listid = "${listId}"]`);
        let card = list.querySelector(`[data-cardid = "${cardId}"]`);
        card.querySelector(`[data-labelid = "${labelInfo.id}"]`).style.display = 'block'

        this.querySelector(".userLabelX").style.display = "inline";
        updateLocalStorage();
    }
    else{
        labelContainer.querySelector(`[data-labelid = "${labelInfo.id}"]`).style.display = 'none';

        let indx = getCard(getList(listId), cardId).labels.indexOf(labelInfo);
        getCard(getList(listId), cardId).labels.splice(indx, 1);

        let list = document.querySelector(`[data-listid = "${listId}"]`);
        let card = list.querySelector(`[data-cardid = "${cardId}"]`);
        card.querySelector(`[data-labelid = "${labelInfo.id}"]`).style.display = 'none';

        this.querySelector(".userLabelX").style.display = "none";
        updateLocalStorage();
    }
}

function editUserLabel(){
    if(document.querySelector('.addingUserLabelKit') == null){

        let labelContainer = this.parentElement
        labelContainer.querySelector('.addUserLabel').remove()
        let labelInfo = getLabelInfo(this.dataset.labelid);
        
        labelContainer.innerHTML += `<div class="addingUserLabelKit userLabel">
                                        <input type="text" class="newLabelName" value= "${labelInfo.name}" onfocus = "this.select()">
                                        <p>Pick a color</p>

                                        <div class="colorContanier">  
                                            
                                        </div>
                                        <div class="colorContanier">  
                                            
                                        </div>

                                        <div class="options">
                                            <div class="createLabelButton" data-labelid = ${labelInfo.id}>Save</div>
                                            <div class="cancelLabelButton" data-labelid = ${labelInfo.id}>Delete</div>
                                        </div>
                                    </div>`

        displayColors();
        let colors = labelContainer.querySelectorAll('.labelColors')

        for(const c of colors){
            if(c.style.backgroundColor == labelInfo.color){
                c.dataset.selected = true;
                c.lastChild.style.display = 'inline-block';
            }
        }

        labelContainer.querySelector('.createLabelButton').addEventListener('click', saveUserLabelEdit);
        labelContainer.querySelector('.cancelLabelButton').addEventListener('click', deleteUserLabel);
    }
    else console.log('pto')
}

function saveUserLabelEdit(){
    let labelInfo = getLabelInfo(this.dataset.labelid);
    let kit = this.parentElement.parentElement;

    let color = kit.querySelector("[data-selected = 'true']").style.backgroundColor
    let name = kit.querySelector('input').value;
    
    if(color != null && name != "" && name != null){
        labelInfo.color = color;
        labelInfo.name = name;

        let lab = kit.parentElement.parentElement.parentElement.querySelector(`[data-labelid = "${labelInfo.id}"].label`);
        lab.innerHTML = name;
        lab.style.backgroundColor = color;

        updateLocalStorage();
        displayLocalStorage()

        let input = document.querySelector('.popUpBack').querySelector('input');
        let cardId = input.dataset.cardid;
        let listId = input.dataset.listid;
        let labels = getCard(getList(listId), cardId).labels;
        let userLabels = document.querySelectorAll('.userLabel');
        displayCheckOnLabels(labels, userLabels)

        for(i = 0; i < labels.length; i++){
            document.querySelector(`[data-labelid = "${labels[i].id}"].label`).style.display = 'block';
        }
    }   
}

function deleteUserLabel(){
    let labelInfo = getLabelInfo(this.dataset.labelid);
    for(i = 0; i < labels.length; i++){
        if(labels[i].id == labelInfo.id) labels.splice(i, 1);
    }

    for(const list of lists){
        let cards = list.cards
        for(const card of cards){
            let lab = card.labels;
            for(i = 0; i < lab.length; i++){
                if(lab[i].id == labelInfo.id) lab.splice(i, 1);
            }
        }
    }

    updateLocalStorage();
    displayLocalStorage();

    let input = document.querySelector('.popUpBack').querySelector('input');
    let cardId = input.dataset.cardid;
    let listId = input.dataset.listid;
    let lab = getCard(getList(listId), cardId).labels;
    let userLabels = document.querySelectorAll('.userLabel');
    displayCheckOnLabels(lab, userLabels);

    for(i = 0; i < lab.length; i++){
        document.querySelector(`[data-labelid = "${lab[i].id}"].label`).style.display = 'block';
    }
}

function editListName(){
    for(const list of lists){
        let newName = document.querySelector(`[data-listid = "${list.id}"]`).querySelector('input').value;
        list.name = newName;
    }

    updateLocalStorage();
    displayLocalStorage();
}

function deleteCard(){
    let listId = this.dataset.listid;
    let cardId = this.dataset.cardid;
    let listInfo = getList(listId);
    let cardInfo = getCard(listInfo, cardId);
    let cardHTML = document.querySelector(`[data-listid = "${listId}"].list`).querySelector(`[data-cardid = "${cardId}"].card`);

    cardHTML.remove();
    listInfo.cards.splice(listInfo.cards.indexOf(cardInfo), 1);
        
    updateLocalStorage();
    displayLocalStorage();

    let labels = document.querySelectorAll('.label');
    for(const l of labels){
        l.style.display = 'none';
    }

    document.querySelector('.popUpBack').style.display = 'none';
}

function displayListOptions(){
    let list = this.parentElement;
    let options = list.querySelector('.listOptions');

    if(options.style.display == 'none'){
        hideListOptions();
        list.style.position = "relative";
        options.style.display = "block";
    }
    else{
        hideListOptions();
    }
}

function hideListOptions(){
    let allOptions = document.querySelectorAll('.listOptions');
    for(const op of allOptions){
        op.style.display = 'none';
        op.parentElement.style.position = 'static';

        children = op.children;
        children[0].addEventListener('click', sortByDate);
        children[1].addEventListener('click', sortByName);
        children[2].addEventListener('click', emptyList);
        children[3].addEventListener('click', deleteList);
    }
}

function sortByName(){
    let cards = getList(this.dataset.listid).cards;
    cards.sort((a, b) => a.name.localeCompare(b.name))

    updateLocalStorage();
    displayLocalStorage();
}

function sortByDate(){
    let cards = getList(this.dataset.listid).cards;
    cards.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    updateLocalStorage();
    displayLocalStorage();
}

function emptyList(){
    let listInfo = getList(this.dataset.listid);
    let listHTML = this.parentElement.parentElement.querySelector(".cardContainer");

    listInfo.cards.length = 0;
    listHTML.innerHTML = "";
    updateLocalStorage();
    hideListOptions();
}

function deleteList(){
    let list = this.parentElement;
    for(const l of lists){
        if(l.id == list.dataset.listid){
            lists.splice(lists.indexOf(l), 1);
            list.remove();
            break;
        }
    }

    updateLocalStorage();
    displayLocalStorage();
}

function changeDueDateColor(){
    let allDates = document.querySelectorAll(".due");
    for(const date of allDates){
        if(date.style.display != 'none'){
            let momt = moment(date.dataset.date);
            let from = momt.fromNow();

            if(date.dataset.done === "true"){
                date.style.backgroundColor = "#69b578";
                date.style.color = "white";
            }
            else if(from.includes("ago")){
                date.style.backgroundColor = "#e05263";
                date.style.color = "white";
            }
            else if(from.includes("hours") || from.includes("hour") || from == "in a day"){
                date.style.backgroundColor = "#ffe736"
                date.style.color = "white";
            }
            else{
                date.style.backgroundColor = "#ffffff00";
                date.style.color = "grey";
            }
        }
    }
}

function markAsDone(){
    let cardInfo = getCard(getList(this.dataset.listid), this.dataset.cardid);
    let dateHTML = document.querySelector(`[data-listid = "${cardInfo.listId}"].list [data-cardid = "${cardInfo.cardId}"].card .due`);
    let due = moment(cardInfo.dueDate + " " + cardInfo.dueTime);
    let from = this.parentElement.parentElement.querySelector(".from");
    let done = !(this.dataset.checked === "true");

    dateHTML.dataset.done = done;
    this.dataset.checked = done;
    cardInfo.checked = done;
    this.style.color = done ? "#979797" : "#00000000";
    

    changeDueDateColor();
    displayTimeLeft(due, from, done);
}

function checkValidDate(input){
    let time = input.parentElement.querySelector("input[type = 'time']");
    let from = input.parentElement.querySelector(".from");
    let check = input.parentElement.querySelector("#check");
    let info = check.lastChild;
    let cardInfo = getCard(getList(info.dataset.listid), info.dataset.cardid);
    let dateHTML = document.querySelector(`[data-listid = "${cardInfo.listId}"].list [data-cardid = "${cardInfo.cardId}"].card .due`);
    let remDate = input.parentElement.querySelector(".remDate");

    if(moment(input.value).format("DD-MMM-YYYY") === "Invalid date"){
        time.style.display = "none";
        from.style.display = "none";
        check.style.display = "none";
        time.value = '';
        cardInfo.dueDate = "";
        cardInfo.dueTime = "";
        dateHTML.style.display = "none";
        remDate.style.display = 'none';
    }
    else{
        let momt = moment(input.value + " " + time.value);
        let stringDate = (momt.format("YYYY") === moment().format("YYYY")) ? momt.format("MMM D") : momt.format("MMM D, YYYY");

        time.style.display = "block";
        from.style.display = "inline-block";
        check.style.display = "inline-block";
        cardInfo.dueDate = input.value;
        cardInfo.dueTime = time.value;
        dateHTML.dataset.date = input.value;
        dateHTML.innerHTML = `<i class="far fa-clock" style = "margin-right: 5px;"></i>` + stringDate;
        dateHTML.style.display = "inline-block";
        remDate.style.display = "inline-block";

        displayTimeLeft(momt, from, cardInfo.checked);
        changeDueDateColor();
    }   

    updateLocalStorage();
}

function removeDate(){
    let input = document.querySelector("input[type = 'date']");
    input.value = "";
    checkValidDate(input);
}