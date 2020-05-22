let tempBlock,tempBlock2,automation;
function snapping(drag) {
    var grab = drag.querySelector('.grabme');
    grab.parentNode.removeChild(grab);
    var blockin = drag.querySelector('.blockin');
    blockin.parentNode.removeChild(blockin);
    if (drag.querySelector('.blockelemtype').value == '1') {
        drag.innerHTML += `<div class='blockyleft'>
                                <img src="data:image/svg+xml,%3C%3Fxml version='1.0'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Capa_1' x='0px' y='0px' viewBox='0 0 490.164 490.164' style='enable-background:new 0 0 490.164 490.164;' xml:space='preserve' width='19px' height='19px'%3E%3Cg%3E%3Cpath d='M50.73,364.375h180.042l153.304,125.79v-125.79h55.358c27.933,0,50.648-23.118,50.648-51.545V51.545 C490.082,23.118,467.368,0,439.434,0H50.73C22.804,0,0.082,23.118,0.082,51.545v261.284C0.082,341.256,22.804,364.375,50.73,364.375 z M75.837,89.542h338.49v30.625H75.837V89.542z M75.837,164.624h338.49v30.625H75.837V164.624z M75.837,239.691h338.49v30.625 H75.837V239.691z' data-original='%23000000' class='active-path' data-old_color='%23000000' fill='%23094180'/%3E%3C/g%3E%3C/svg%3E%0A">
                                <p class='blockyname'>New Message</p>
                            </div>
                            <div class='blockyright'>
                                <img src="data:image/svg+xml,%3Csvg width='12' height='3' viewBox='0 0 12 3' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.2' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3Ccircle cx='5.9998' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3Ccircle cx='10.7996' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3C/svg%3E%0A">
                            </div>
                            <div class='blockydiv' data-action data-message data-agent-id data-keyword>
                            </div>
                            <div class='blockyinfo'>Your <span>new message</span> goes here</div>`;
    } else if (drag.querySelector('.blockelemtype').value == '2') {
        drag.innerHTML += `<div class='blockyleft'>
                                <img src="data:image/svg+xml,%3C%3Fxml version='1.0'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Capa_1' x='0px' y='0px' viewBox='0 0 490.064 490.064' style='enable-background:new 0 0 490.064 490.064;' xml:space='preserve' width='19px' height='19px' class=''%3E%3Cg%3E%3Cg%3E%3Cellipse cx='380.755' cy='271.141' rx='71.374' ry='70.911' data-original='%23000000' class='active-path' data-old_color='%23000000' fill='%230000B0'/%3E%3Cpath d='M425.618,358.207h-89.725c0,0-64.448,0.716-64.448,59.738c0,58.663,0,72.088,0,72.088h218.62c0,0,0-13.425,0-72.088 C490.064,359.279,425.618,358.207,425.618,358.207z' data-original='%23000000' class='active-path' data-old_color='%23000000' fill='%230000B0'/%3E%3Cpath d='M152.59,0.032C68.451,0.032,0,68.064,0,151.68c0,90.66,80.61,163.538,174.126,150.093l75.301,59.852v-92.918 c35.519-28.969,55.739-71.188,55.739-117.026C305.166,68.064,236.715,0.032,152.59,0.032z M141.553,221.851l-61.258-50.265 l19.442-23.689l36.073,29.627l62.648-86.712l24.826,17.947L141.553,221.851z' data-original='%23000000' class='active-path' data-old_color='%23000000' fill='%230000B0'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A">
                                <p class='blockyname'>Assign an agent</p>
                            </div>
                            <div class='blockyright'>
                                <img src="data:image/svg+xml,%3Csvg width='12' height='3' viewBox='0 0 12 3' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.2' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3Ccircle cx='5.9998' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3Ccircle cx='10.7996' cy='1.2' r='1.2' fill='%23C5C5D0'/%3E%3C/svg%3E%0A">
                            </div>
                            <div class='blockydiv' data-action data-message data-agent-id data-keyword>
                            </div>
                            <div class='blockyinfo'>Create <span>a ticket</span> and <span>assign an agent</span></div>`;
    }
    return true;
}

const drag = function(block) {
    block.classList.add('blockdisabled');
    tempBlock2 = block;
}

const release = function() {
    tempBlock2.classList.remove('blockdisabled');
}

const changeDivContent = (parent_id,content) => {
    $('input.blockid').each(function(){
        if($(this).val() == parent_id){
            $(this).parent().find('.blockyinfo').text(content);
        }
    })
}

const setActions = function() {
    tempBlock = event.target.closest('.block');
    $('#properties').addClass('expanded');
    $('#propwrap').addClass('itson');
    tempBlock.classList.add('selectedblock'); 
    for(let attribute of ['data-message','data-keyword','data-agent-id','data-action']){
        if(!tempBlock.querySelector('.blockid').hasAttribute(attribute)){
            const att = document.createAttribute(attribute); // Create a "class" attribute
            att.value = ''; 
            tempBlock.querySelector('.blockid').setAttributeNode(att)
        }
    }
    //set actions
    if(tempBlock.querySelector('input[name="blockelemtype"]').value == '1'){
        const message_text = tempBlock.querySelector('.blockid').getAttribute('data-message'); 
        const keyword_val = tempBlock.querySelector('.blockid').getAttribute('data-keyword'); 
        $('#proplist').html(`<p class="error"></p>
                            <p class="success"></p>
                            <p class="inputlabel">When the keyword is</p>
                            <input type="text" name="keyword-match" value="${keyword_val}" autocomplete="off">
                            <p class="inputlabel">Send a message</p>
                            <textarea name="message"></textarea>
                            <div class="text-center">                            
                                <button class="btn btn-primary save" id="save-message" data-action="message">Save</button>
                            </div>`);
        $('textarea[name="message"]').val(message_text);                  
    }else if(tempBlock.querySelector('input[name="blockelemtype"]').value == '2'){
        const agent_id =  tempBlock.querySelector('.blockid').getAttribute('data-agent-id');
        $('#proplist').html(`<p class="error"></p>
                             <p class="success"></p>
                             <p class="inputlabel">Assign Agent</p>
                             <select id="agents">
                                <option value="sheik">Sheik</option>
                             </select>
                             <div class="text-center">             
                                <button class="btn btn-primary save" id="save-agent" data-action="agent">Save</button>
                            </div>`);
        $('#agents').val(agent_id);
        $('#agents').select2({width:'90%'});
    }

    $('.save').on('click',function(){
        $('.error').text('');
        $('.success').fadeOut();
        const action = $(this).attr('data-action');
        const parent_id = tempBlock.querySelector('.blockid').value;
        if(/agent/i.test(action)){
            if($('#agents').val()){
                tempBlock.querySelector('.blockid').setAttribute('data-action','agent');
                tempBlock.querySelector('.blockid').setAttribute('data-agent-id',$('#agents').val());
                const agent_name = $('#agents option:selected').text();
                changeDivContent(parent_id,`Assign to ${agent_name}`);
                $('.success').text('Saved Successfully').fadeIn().delay(3000).fadeOut();
            }else{
                $('.error').text('Please select the agent');
            }
        }else if(/message/i.test(action)){
            const keyword = $('input[name="keyword-match"]').val();
            const message = $('textarea[name="message"]').val();
            if(!keyword || !message){
                $('.error').text('Please enter the values in the empty fields');
            }else{
                tempBlock.querySelector('.blockid').setAttribute('data-action','message');
                tempBlock.querySelector('.blockid').setAttribute('data-message',message); 
                tempBlock.querySelector('.blockid').setAttribute('data-keyword',keyword); 
                changeDivContent(parent_id,message);
                $('.success').text('Saved Successfully').fadeIn().delay(3000).fadeOut();
            }
        }
    })
}

const closeSetActionTab = function(){
    $('#properties').removeClass('expanded');
    setTimeout(function(){
        $('#propwrap').removeClass('itson'); 
    }, 300);
    tempBlock.classList.remove('selectedblock');
}
    
const docReadyFn = function() {
    flowy(document.getElementById('canvas'), drag, release, snapping);
}

const deleteBlocks = function() {
    flowy.deleteBlocks();
}

const toggleLeftCard = function() {
    if($(this).parents('#leftcard').hasClass('show')){
        $(this).parents('#leftcard').removeClass('show')
                                    .addClass('hide')
        $(this).parents('#leftcard').css({'left':'-363px'});
        $('#canvas').css({'left':'0px','width':'100%'});
    }else{
        $(this).parents('#leftcard').removeClass('hide')
                                    .addClass('show')
        $(this).parents('#leftcard').css({'left':'0'});
        $('#canvas').css({'left':'361px','width':'calc(100% - 361px)'});
    }
}

const buildJSONForCustomBot = automation => {
    const automation_json_data = [];
    for(let automation_data of automation.blocks){
        const k = $(`input.blockid[value=${automation_data.id}]`).attr('data-keyword'),
                m = $(`input.blockid[value=${automation_data.id}]`).attr('data-message');
        if(k && m){
            const child_automated_data = automation.blocks.filter(data => data.parent == automation_data.id);
            if(child_automated_data.length){
                for(let child_data of child_automated_data){
                    const a = $(`input.blockid[value=${child_data.id}]`).attr('data-agent-id');
                    if(a){
                        automation_json_data.push({[k]:m,a});
                        break;
                    }
                }
            }else{
                automation_json_data.push({[k]:m});
            }
        }
    }
    console.log(automation_json_data);
}

const saveAutomation = function() {
    automation = flowy.output();
    buildJSONForCustomBot(automation);
}

document.addEventListener('DOMContentLoaded',docReadyFn);

$(document).on('click','.blockyright',setActions);

$(document).on('click','#removeblock',deleteBlocks);

$(document).on('click','#close',closeSetActionTab);

$(document).on('click','#closecard', toggleLeftCard);

$(document).on('click','#save-automation', saveAutomation);

