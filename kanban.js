// kanban.js

function allowDrop(ev) {
    ev.preventDefault();
    if(ev.target.classList.contains('kanban-column') || ev.target.closest('.kanban-column')) {
        let col = ev.target.classList.contains('kanban-column') ? ev.target : ev.target.closest('.kanban-column');
        col.classList.add('drag-over');
    }
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    setTimeout(() => {
        ev.target.classList.add('dragging');
    }, 0);
}

function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    let card = document.getElementById(data);
    
    let column = ev.target.classList.contains('kanban-column') ? ev.target : ev.target.closest('.kanban-column');
    
    if (column && card) {
        let cardsContainer = column.querySelector('.kanban-cards');
        
        let emptyState = cardsContainer.querySelector('.empty-state');
        if(emptyState) {
            emptyState.style.display = 'none';
        }
        
        cardsContainer.appendChild(card);
        column.classList.remove('drag-over');
        updateCounts();
    }
}

function updateCounts() {
    document.querySelectorAll('.kanban-column').forEach(col => {
        let count = col.querySelectorAll('.kanban-card').length;
        let countSpan = col.querySelector('.task-count');
        if (countSpan) {
            countSpan.textContent = count;
        }
        
        let cardsContainer = col.querySelector('.kanban-cards');
        let emptyState = cardsContainer.querySelector('.empty-state');
        
        if(count === 0 && !emptyState) {
            let emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.textContent = 'Drop tasks here';
            cardsContainer.appendChild(emptyDiv);
        } else if (count > 0 && emptyState) {
            emptyState.style.display = 'none';
        } else if (count === 0 && emptyState) {
            emptyState.style.display = 'block';
        }
    });
}

document.addEventListener('dragend', function(ev) {
    if(ev.target.classList && ev.target.classList.contains('kanban-card')) {
        ev.target.classList.remove('dragging');
    }
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
    });
});

document.addEventListener('dragleave', function(ev) {
    if(ev.target.classList && ev.target.classList.contains('kanban-column')) {
        ev.target.classList.remove('drag-over');
    }
});
