
const fulWidth = 0.99 * document.documentElement.clientWidth;
const fulHeight = 0.99 * document.documentElement.clientHeight;
const body = document.querySelector(`body`);

class Circle {
    constructor(id, radius, position, velocity, color) {

        this.id = id;
        this.radius = radius;
        this.position = position;
        this.velocity = velocity;
        this.color = color;

        this.createDiv = function() { 
            let circleDiv = document.createElement(`div`);
            circleDiv.id = (`circle_${id}`);
            circleDiv.classList.add(`circle`);
            body.appendChild(circleDiv);
        };

        this.update = function() {
            const delta = 1;
            this.position = [   this.position[0] + delta*this.velocity[0],
                                this.position[1] + delta*this.velocity[1]   ]; 
            
            if (this.position[0] >= (fulWidth - this.radius) ) {
                this.velocity[0] *= -1;
                this.position[0] = fulWidth - this.radius - 1;
            };

            if (this.position[0] <= this.radius) {
                this.velocity[0] *= -1;
                this.position[0] = this.radius + 1;
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

        this.draw = function() {
            let circleDiv = document.getElementById(`circle_${id}`);
            circleDiv.style.left = `${this.position[0] - this.radius}px`;
            circleDiv.style.top = `${this.position[1] - this.radius}px`;   
        };

    };
};

function getPairs(number) {
    let pairs = [];
    for (n = 0; n <= number - 2; n++) {
      for (j = n + 1; j <= number - 1; j++) {
        pairs.push([n, j]);
      }
    }
    return pairs;
};

function createCircles (numberOfCircles) {
    let circles = [];
    for (i = 1; i <= numberOfCircles; i++) {
        let CurrentCircle = new Circle(i);
        CurrentCircle.radius = 20;
        CurrentCircle.color = `white`;
        CurrentCircle.position = [ Math.floor(Math.random()*(fulWidth - CurrentCircle.radius )), 
                                    Math.floor(Math.random()*(fulHeight - CurrentCircle.radius )) ];
        CurrentCircle.velocity = [ Math.floor(Math.random()*10) - 5, 
                                    Math.floor(Math.random()*10) - 5  ];
        circles.push(CurrentCircle);
        circles[i-1].createDiv();
    }
    return circles;
};

function gotCollision (circle_1, circle_2) {
    let dx = circle_1.position[0] - circle_2.position[0];
    let dy = circle_1.position[1] - circle_2.position[1];
    let collision = ( Math.sqrt( dx**2 + dy**2 )  ) <= 
                    (circle_1.radius + circle_2.radius) ? true : false;
    return collision;
};

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

function collisionVector (circle_1, circle_2) {
    const dx = circle_2.position[0] - circle_1.position[0];
    const dy = circle_2.position[1] - circle_1.position[1];
    const vector = [dx, dy];
    return vector;
};

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

function scaleVector2length1 ([x0, y0]) {
    let scale = 1/((x0**2 + y0**2)**0.5);
    let outputVector = [scale*x0, scale*y0];
    return outputVector;
};

function getDeterminant (matrix) {
    let determinant = 1/( matrix[0][0]*matrix[1][1] - 
                          matrix[0][1]*matrix[1][0] );
    return determinant;
};

function getInverse (matrix)  {
    let det = getDeterminant(matrix);
    let inverse = [ [ matrix[1][1]/det, -matrix[0][1]/det ],
                    [ -matrix[1][0]/det, matrix[0][0]/det ] ];
    return inverse;
};

function getVectorInNewBasis (vector, basis_matrix) {
    let vectorInNewBasis = [];
    vectorInNewBasis[0] = basis_matrix[0][0]*vector[0] + 
                          basis_matrix[0][1]*vector[1];
    vectorInNewBasis[1] = basis_matrix[1][0]*vector[0] + 
                          basis_matrix[1][1]*vector[1];                          
    return vectorInNewBasis
};

let numberOfCircles = 15;
let circles = createCircles(numberOfCircles);
let pairs = getPairs(numberOfCircles);

document.documentElement.style.setProperty(`--circleColor`, circles[0].color);
document.documentElement.style.setProperty(`--circleWidth`, `${circles[0].radius * 2}px`);
document.documentElement.style.setProperty(`--circleHeight`, `${circles[0].radius * 2}px`);

window.setInterval( () => {

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