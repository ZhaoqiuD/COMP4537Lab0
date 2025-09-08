/**
 * Disclosure:
 * Parts of this assignment were completed with the assistance of AI (ChatGPT).
 * AI support was used to help outline the basic structure of the three main classes
 * and to provide guidance on some of the more complex method logic.
 * All code has been reviewed, understood, and tested by me.
 */




/**
 * MemoryButton class - represents a single button in the memory game
 * This class is responsible for creating, positioning, and managing the state and appearance of each button
 * Uses object-oriented design to encapsulate all button behaviors
 */
class MemoryButton {

    constructor(id, color, order) {
        this.id = id;
        this.color = color;
        this.order = order;
        this.element = null;
        this.revealed = false;
        this.isAnimatingFlag = false;
    }

    /**
       * Create the DOM element for the button
       * Set the button’s style, ID, background color, and text
       */
    createElement() {
        const button = document.createElement('button');
        button.className = 'memory-button';
        button.id = `button-${this.id}`;
        button.style.backgroundColor = this.color;
        button.textContent = this.order + 1;

        // Add transition end event listener to track animation status
        button.addEventListener('transitionend', () => {
            this.isAnimatingFlag = false;
        });

        this.element = button;
        return button;
    }

    /**
      * Position the button at the specified coordinates
      * Handle button animation and position changes
      */
    positionAt(x, y) {
        if (this.element) {
            this.isAnimatingFlag = true;


            if (!this.element.style.left) {
                this.element.style.transition = 'none';
                this.element.style.left = `${x}px`;
                this.element.style.top = `${y}px`;


                this.element.offsetHeight;


                setTimeout(() => {
                    this.element.style.transition = 'left 0.5s ease-in-out, top 0.5s ease-in-out';

                    this.isAnimatingFlag = false;
                }, 50);
            } else {
                this.element.style.transition = 'left 0.5s ease-in-out, top 0.5s ease-in-out';
                this.element.style.left = `${x}px`;
                this.element.style.top = `${y}px`;


                setTimeout(() => {
                    this.isAnimatingFlag = false;
                }, 600);
            }
        }
    }

    /**
   * Check whether the button is currently animating
   * Used to prevent interaction while the button is moving
   */
    isAnimating() {
        return this.isAnimatingFlag;
    }

    /**
     * Hide the number on the button
     * Called at the start of the game when the player needs to memorize positions
     */
    hideNumber() {
        if (this.element) {
            this.element.textContent = '';
        }
    }

    /**
     * Reveal the number on the button
     * Called when the player clicks or when the game ends
     */
    revealNumber() {
        if (this.element) {
            this.element.textContent = this.order + 1;
            this.revealed = true;
        }
    }

    /**
     * Mark the button as clicked
     * Adds visual feedback to indicate the button was clicked
     */

    markClicked() {
        if (this.element) {
            this.element.classList.add('clicked');
        }
    }
}

/**
 * GameUI class - responsible for managing game UI elements and interactions
 */
class GameUI {
    /**
     * Create a new GameUI instance
     */
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.messageElement = document.getElementById('message');
        this.inputElement = document.getElementById('buttonCount');
        this.goButton = document.getElementById('goButton');


        document.getElementById('inputLabel').textContent = messages.inputLabel;
        this.goButton.textContent = messages.goButton;
    }

    /**
     * Get the value of the button count input field
     */
    getButtonCount() {
        return parseInt(this.inputElement.value);
    }

    /**
    * Display a message to the player
    */
    showMessage(text, type) {
        this.messageElement.textContent = text;
        this.messageElement.className = `message ${type}`;
    }

    /**
     * Clear the game area and message
     */
    clearGameArea() {
        this.gameArea.innerHTML = '';
        this.messageElement.textContent = '';
        this.messageElement.className = 'message';
    }

    /*
     * Add a button element to the game area
     */
    addButtonToGameArea(buttonElement) {
        this.gameArea.appendChild(buttonElement);
    }

    /**
     * Get the dimensions of the game area
     */
    getGameAreaDimensions() {
        return this.gameArea.getBoundingClientRect();
    }

    /**
     * Add a click event listener to the Go button
     */
    addGoButtonListener(callback) {
        this.goButton.addEventListener('click', callback); // Add click listener
    }
}

/**
 * MemoryGame class - responsible for managing game logic
 */
class MemoryGame {
    /**
     * Create a new MemoryGame instance
     */
    constructor() {
        this.ui = new GameUI();
        this.buttons = [];
        this.buttonCount = 0;
        this.scrambleCount = 0;
        this.isScrambling = false;
        this.expectedClickOrder = [];
        this.currentClickIndex = 0;
        this.gameActive = false;
        this.usedColors = [];

        // Add event listener to the Go button
        this.ui.addGoButtonListener(() => this.startGame());
    }

    /**
     * Start a new game
     */
    startGame() {

        this.clearGame();


        const count = this.ui.getButtonCount();


        if (isNaN(count) || count < 3 || count > 7) {
            this.ui.showMessage(messages.invalidInput, 'error');  
            return;
        }

        this.buttonCount = count;
        this.createButtons();

 
        setTimeout(() => this.startScrambling(), this.buttonCount * 1000);
    }

    /**
     * Create the buttons
     */
    createButtons() {
 
        this.buttons = [];
        this.ui.clearGameArea();  

        // Create new buttons
        for (let i = 0; i < this.buttonCount; i++) {
            const color = this.getRandomColor(); 
            const button = new MemoryButton(i, color, i); 
            this.buttons.push(button); // Add button to the array

            // Add button element to the game area
            this.ui.addButtonToGameArea(button.createElement());
        }

        // Make sure buttons are positioned in a row initially
        this.positionButtonsInRow();
    }

    /**
     * Arrange the buttons in a row
     */
    positionButtonsInRow() {
        const gameAreaRect = this.ui.getGameAreaDimensions();  
        const buttonWidth = 160;  
        const buttonHeight = 80; 
        const spacing = 10;  

        // Cqalculate total width needed for buttons and spacing
        const totalWidth = this.buttonCount * buttonWidth + (this.buttonCount - 1) * spacing;

        // If total width exceeds game area width, arrange buttons in multiple rows
        if (totalWidth > gameAreaRect.width) {
            const buttonsPerRow = Math.floor(gameAreaRect.width / (buttonWidth + spacing));  
            const rows = Math.ceil(this.buttonCount / buttonsPerRow); 

            for (let i = 0; i < this.buttons.length; i++) {
                const row = Math.floor(i / buttonsPerRow);  
                const col = i % buttonsPerRow;  

                const x = col * (buttonWidth + spacing);  
                const y = row * (buttonHeight + spacing);  

                this.buttons[i].positionAt(x, y);  
            }
        } else {
            // Make sure buttons are centered in the game area
            const startX = (gameAreaRect.width - totalWidth) / 2; 

            for (let i = 0; i < this.buttons.length; i++) {
                const x = startX + i * (buttonWidth + spacing);  
                this.buttons[i].positionAt(x, 10); 
            }
        }
    }

    /**
     * Start scrambling the buttons
     */
    startScrambling() {
        this.isScrambling = true;  
        this.scrambleCount = 0; 
        this.scrambleButtons(); 
    }

    /**
     * Scramble the buttons
     */
    scrambleButtons() {

        if (this.scrambleCount >= this.buttonCount) {
            this.finishScrambling();  
            return;
        }

        const buttonsAnimating = this.buttons.some(button => button.isAnimating());  


        if (buttonsAnimating) {
            setTimeout(() => this.scrambleButtons(), 100);  
            return;
        }

        const gameAreaRect = this.ui.getGameAreaDimensions();  
        const buttonWidth = 160;  
        const buttonHeight = 80; 

        // Create grid parameters
        const gridCellWidth = buttonWidth + 10; 
        const gridCellHeight = buttonHeight + 10;  

        // Calculate number of rows and columns that fit in the game area
        const cols = Math.max(1, Math.floor(gameAreaRect.width / gridCellWidth)); 
        const rows = Math.max(1, Math.floor(gameAreaRect.height / gridCellHeight));  

 
        const totalCells = rows * cols; // Calculate total grid cells
        if (totalCells < this.buttonCount) {
            // If not enough cells, place buttons randomly
            for (const button of this.buttons) {
                const maxX = Math.max(0, gameAreaRect.width - buttonWidth);  
                const maxY = Math.max(0, gameAreaRect.height - buttonHeight);  

                const randomX = Math.floor(Math.random() * maxX); 
                const randomY = Math.floor(Math.random() * maxY);  

                button.positionAt(randomX, randomY); 
            }
        } else {
 
            const grid = Array(rows).fill().map(() => Array(cols).fill(false)); 

 
            for (const button of this.buttons) {
                let placed = false; 
                let attempts = 0;  
                const maxAttempts = 50; 

                while (!placed && attempts < maxAttempts) {
    
                    const randomRow = Math.floor(Math.random() * rows);  
                    const randomCol = Math.floor(Math.random() * cols); 

                    if (!grid[randomRow][randomCol]) {
                        // Put the button in this cell if it's free
                        grid[randomRow][randomCol] = true;  

                        const x = randomCol * gridCellWidth;  
                        const y = randomRow * gridCellHeight; 

                        button.positionAt(x, y);  
                        placed = true;  
                    }

                    attempts++;  
                }

                // If not placed after max attempts, place randomly
                if (!placed) {
                    const randomX = Math.floor(Math.random() * (gameAreaRect.width - buttonWidth));  
                    const randomY = Math.floor(Math.random() * (gameAreaRect.height - buttonHeight)); 
                    button.positionAt(randomX, randomY);  
                }
            }
        }

        this.scrambleCount++;  

        // Plane next scramble after a delay
        setTimeout(() => this.scrambleButtons(), 2000); 
    }

    /**
     * Finish the scrambling process
     */
    finishScrambling() {
        this.isScrambling = false; 

        // Hide button numbers
        for (const button of this.buttons) {
            button.hideNumber();  
        }

        // Set up expected click order
        this.expectedClickOrder = [...this.buttons].sort((a, b) => a.order - b.order);  
        this.currentClickIndex = 0; 

        // Make buttons clickable
        for (const button of this.buttons) {
            button.element.addEventListener('click', () => this.handleButtonClick(button)); // Add click listener to each button
        }

        this.gameActive = true; 
    }

    /**
     * Handle a button click event
     */
    handleButtonClick(button) {
        if (!this.gameActive || this.isScrambling || button.isAnimating()) {
            return; // If game is not active, scrambling, or button is animating, ignore click
        }

        const expectedButton = this.expectedClickOrder[this.currentClickIndex];  

        if (button.id === expectedButton.id) {
            // When the correct button is clicked
            button.revealNumber(); 
            button.markClicked();  
            this.currentClickIndex++;  

            // Check if all buttons have been clicked
            if (this.currentClickIndex >= this.buttonCount) {
                this.ui.showMessage(messages.excellentMemory, 'success'); 
                this.gameActive = false; 
            }
        } else {
            // When the wrong button is clicked
            this.ui.showMessage(messages.wrongOrder, 'error');  

            // Show all button numbers
            for (const btn of this.buttons) {
                btn.revealNumber(); 
            }

            this.gameActive = false; 
        }
    }

    /**
     * Clear the game
     */
    clearGame() {
        this.buttons = [];  
        this.ui.clearGameArea();  
        this.isScrambling = false;  
        this.gameActive = false; 
    }

    /**
     * Generate a random color
     */
    getRandomColor() {
        const distinctColors = [
            '#FF0000', 
            '#00FF00', 
            '#0000FF',  
            '#FFFF00',  
            '#FF00FF',  
            '#00FFFF',  
            '#FF8000',  
            '#8000FF', 
            '#0080FF',  
            '#FF0080', 
        ];

        // If usedColors is not defined, initialize it
        if (!this.usedColors) {
            this.usedColors = [];  
        }

        // Filter out colors that have already been used
        const availableColors = distinctColors.filter(color => !this.usedColors.includes(color)); // Get available colors

        // If no colors are available, reset the used colors
        if (availableColors.length === 0) {
            this.usedColors = [];  
            return distinctColors[Math.floor(Math.random() * distinctColors.length)];  
        }

        // Select a random color from the available colors
        const selectedColor = availableColors[Math.floor(Math.random() * availableColors.length)];  
        // Record the selected color as used
        this.usedColors.push(selectedColor);  


        return selectedColor;  
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();  
});