let intervalID;

// const numberInput = document.querySelector(`#input_1`);
const numSpan = document.getElementById(`number`);


const circleSpace = document.querySelector(`#circleSpace`);

const fulWidth = circleSpace.clientWidth;
const fulHeight = circleSpace.clientHeight;
const spaceTop = circleSpace.clientTop;
const spaceLeft = circleSpace.offsetLeft;

//Circles class  - made for circles objects which will have thair positions
//and velocities represented as vectors, a raius, an id and a color

class Circle { 
    constructor(id, radius, position, velocity, color) {

        this.id = id;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.color = color;


        //Method for creating a html element - div with rounded borders
        //which will graphicaly represent the circle object

        this.createDiv = function() {
            let circleDiv = document.createElement(`div`);
            circleDiv.id = (`circle_${id}`);
            circleDiv.classList.add(`circle`);
            circleSpace.appendChild(circleDiv);
        };


        //Method for updating circles position and speed vectors
        //for each time iteration. It contains the conditions
        //for circle collisions with "walls" - the viewport edges

        this.update = function() {
            const delta = 1;
            this.position = [   this.position[0] + delta*this.velocity[0],
                                this.position[1] + delta*this.velocity[1]   ]; 
            
            if (this.position[0] >= (fulWidth + spaceLeft - this.radius) ) {
                this.velocity[0] *= -1;
                this.position[0] = fulWidth + spaceLeft - this.radius - 1;
            };

            if (this.position[0] <= spaceLeft + this.radius) {
                this.velocity[0] *= -1;
                this.position[0] = spaceLeft + this.radius + 1;
            };

            if (this.position[1] >= (fulHeight - this.radius) ) {
                this.velocity[1] *= -1;
                this.position[1] = fulHeight - this.radius - 1;
            };

            if (this.position[1] <= this.radius) {
                this.velocity[1] *= -1;
                this.position[1] = this.radius + 1;
            };
        };


        //method synchronises the position of a DIV element
        //representing the circle object with the current object
        //coordinates

        this.draw = function() {
            let circleDiv = document.getElementById(`circle_${id}`);
            circleDiv.style.left = `${this.position[0] - this.radius}px`;
            circleDiv.style.top = `${this.position[1] - this.radius}px`;   
        };

    };
};


//circle with circle collision detecting algorythm relies
//on the array of pairs - numbers (or id) of circle objects
//which can collide with each other. e.x.: pair [1, 2]
//represents possible collision of circles with numbers 1 and 2
//there can't be collision of a circle to itsels, or [1, 1] pair
//and each pair is unique, so there is no [2, 1] pair for example

function getPairs(number) {
    let pairs = [];
    for (n = 0; n <= number - 2; n++) {
      for (j = n + 1; j <= number - 1; j++) {
        pairs.push([n, j]);
      }
    }
    return pairs;
};


//function creates and array of circle objects and DIV elements for each of them
//all the circles are the same bu their coordinates and velocity vectors are
//randomized

function createCircles (numberOfCircles) {
    let circles = [];
    for (i = 1; i <= numberOfCircles; i++) {
        let CurrentCircle = new Circle(i);
        CurrentCircle.radius = 20;
        CurrentCircle.color = `white`;
        CurrentCircle.position = [ spaceLeft + Math.floor(Math.random()*fulWidth) - CurrentCircle.radius, 
                                   spaceTop + Math.floor(Math.random()*fulHeight) - CurrentCircle.radius ];
        CurrentCircle.velocity = [ Math.floor(Math.random()*10) - 5, 
                                    Math.floor(Math.random()*10) - 5  ];
        circles.push(CurrentCircle);
        circles[i-1].createDiv();
    }
    return circles;
};


//function which to see if there was a circle to circle collision 

function gotCollision (circle_1, circle_2) {
    let dx = circle_1.position[0] - circle_2.position[0];
    let dy = circle_1.position[1] - circle_2.position[1];
    let collision = ( Math.sqrt( dx**2 + dy**2 )  ) <= 
                    (circle_1.radius + circle_2.radius) ? true : false;
    return collision;
};

//function which "pushes out" circles which collided with enough speed
//to have interpenetration. 

function PushOut (circle_1, circle_2) {
    let vector = collisionVector(circle_1, circle_2);
    let distance = Math.sqrt(
        (circle_1.position[0] - circle_2.position[0])**2 + 
        (circle_1.position[1] - circle_2.position[1])**2 )
    let delta = (circle_1.radius + circle_2.radius) - distance;
    let k = (distance + delta) / distance;
    vector = [vector[0]*k, vector[1]*k];
    circle_2.position[0] = circle_1.position[0] + vector[0];
    circle_2.position[1] = circle_1.position[1] + vector[1];
};


//function which computes the resulting velocity vectors
//of the circles as a result of their collision

function updateSpeedsWhenCirclesCollide (circle_1, circle_2) {
    let vectorCol = collisionVector(circle_1, circle_2);
    let basis_i = scaleVector2length1(vectorCol);
    let basis_j = rotate2DVector90(basis_i);
    
    let basis_Matrix = [
        [  basis_i[0], basis_j[0]  ],
        [  basis_i[1], basis_j[1]  ]
    ];
    
    let inverse_basis_Matrix = getInverse(basis_Matrix); 
    let v_1_newBasis = getVectorInNewBasis(circle_1.velocity, inverse_basis_Matrix);
    let v_2_newBasis = getVectorInNewBasis(circle_2.velocity, inverse_basis_Matrix);
    
    let v_1_PostCollision_newBasis = [
        v_2_newBasis[0],
        v_1_newBasis[1]
    ];

    let v_2_PostCollision_newBasis = [
        v_1_newBasis[0],
        v_2_newBasis[1]
    ];
    
    let v_1_PostCollision_oldBasis =  getVectorInNewBasis(v_1_PostCollision_newBasis, basis_Matrix);
    let v_2_PostCollision_oldBasis =  getVectorInNewBasis(v_2_PostCollision_newBasis, basis_Matrix);
    
    circle_1.velocity = v_1_PostCollision_oldBasis;
    circle_2.velocity = v_2_PostCollision_oldBasis;
};


//function gets the vector, which connects
//centers of colliding circles

function collisionVector (circle_1, circle_2) {
    const dx = circle_2.position[0] - circle_1.position[0];
    const dy = circle_2.position[1] - circle_1.position[1];
    const vector = [dx, dy];
    return vector;
};


//function creates a vector, orthogonal of a given one
//it is needed to create new basis for a coordinate
//system of colliding circles

function rotate2DVector90 ([x0, y0]) {
    const rotMatrix90 = [
        [0, -1],
        [1, 0]          ];
    let outputVector = [
        x0*rotMatrix90[0][0] + y0*rotMatrix90[0][1],
        x0*rotMatrix90[1][0] + y0*rotMatrix90[1][1]
    ];
    return outputVector;
};

//function scales the vector to have a lrngth of 1
//needed to make all basis vector a 1 length vectors

function scaleVector2length1 ([x0, y0]) {
    let scale = 1/((x0**2 + y0**2)**0.5);
    let outputVector = [scale*x0, scale*y0];
    return outputVector;
};


//function computes a deerminant of a 2 by 2 matrix
//needed for computing new basis matrix

function getDeterminant (matrix) {
    let determinant = 1/( matrix[0][0]*matrix[1][1] - 
                          matrix[0][1]*matrix[1][0] );
    return determinant;
};

//function computes an inverse of a 2 by 2 matrix
//needed for computing new basis matrix

function getInverse (matrix)  {
    let det = getDeterminant(matrix);
    let inverse = [ [ matrix[1][1]/det, -matrix[0][1]/det ],
                    [ -matrix[1][0]/det, matrix[0][0]/det ] ];
    return inverse;
};


//functions computes a velocity vector for a new basis

function getVectorInNewBasis (vector, basis_matrix) {
    let vectorInNewBasis = [];
    vectorInNewBasis[0] = basis_matrix[0][0]*vector[0] + 
                          basis_matrix[0][1]*vector[1];
    vectorInNewBasis[1] = basis_matrix[1][0]*vector[0] + 
                          basis_matrix[1][1]*vector[1];                          
    return vectorInNewBasis
};

//function to delete all circle objects in circles array and
//all associated divs, also stops the "setInterval" loop

function ShowStop (circlesArray) {
    clearInterval(intervalId);
    circlesArray = [];
    circleSpace.innerHTML = '';
};


//cycle with a timestep of 10ms, circle positions are updated every cycle step

function ShowTime () {
    intervalId = window.setInterval( () => {

        circles.forEach( (circle) => {
            circle.update();
        });
    
        pairs.forEach( (pair) => {
            if ( gotCollision( circles[pair[0]], circles[pair[1]] ) ) {
                updateSpeedsWhenCirclesCollide( circles[pair[0]], circles[pair[1]] );
                PushOut ( circles[pair[0]], circles[pair[1]] );
            };
        });
    
        circles.forEach( (circle) => {
            circle.draw();
        });
    
    }, 10); 
};



//actual circles creation

let numberOfCircles = Number(numSpan.textContent);
let circles = createCircles(numberOfCircles);
//possible circle collision pairs array
let pairs = getPairs(numberOfCircles);



function makeLess() {
    if (numberOfCircles > 2) {
        numberOfCircles -= 1;
        numSpan.textContent = numberOfCircles;

        ShowStop (circles);
        circles = createCircles(numberOfCircles);
        pairs = getPairs(numberOfCircles);
        ShowTime ();
    }
};

function makeMore() {
    if (numberOfCircles < 100) {
        numberOfCircles += 1;
        numSpan.textContent = numberOfCircles;

        ShowStop (circles);
        circles = createCircles(numberOfCircles);
        pairs = getPairs(numberOfCircles);
        ShowTime ();

    }
};



document.documentElement.style.setProperty(`--circleColor`, circles[0].color);
document.documentElement.style.setProperty(`--circleWidth`, `${circles[0].radius * 2}px`);
document.documentElement.style.setProperty(`--circleHeight`, `${circles[0].radius * 2}px`);

ShowTime ();