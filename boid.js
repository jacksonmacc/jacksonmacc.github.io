import * as renderer from "./boid_renderer.js"

const AVOIDANCE_ACCELERATION_AMOUNT = 0.15;
const AVOIDANCE_ACCELERATION_RANGE = 0.1;

const DIRECTION_ACCELERATION_AMOUNT = 0.004;
const DIRECTION_ACCELERATION_RANGE = 0.2;

const MIDDLE_ACCELERATION_AMOUNT = 0.004;
const MIDDLE_ACCELERATION_RANGE = 0.2;

export var BOID_SPEED = 0.05;

export function updateSpeed(newSpeed) {
    BOID_SPEED = newSpeed;
}

const MAX_ACCEL = 0.00009;

export const WRAP_BORDER = 1.1;

export class Boid {
    constructor() {
        this.positionX = 0;
        this.positionY = 0;
        this.rotation = 0;
        this.velocityX = 0;
        this.velocityY = 0;

        this.accelX = 0;
        this.accelY = 0;
    }



    update(others) {
        this.accelX = 0;
        this.accelY = 0;

        this.accelAwayFromOthers(others, AVOIDANCE_ACCELERATION_AMOUNT, AVOIDANCE_ACCELERATION_RANGE);
        this.accelInSameDirectionAsOthers(others, DIRECTION_ACCELERATION_AMOUNT, DIRECTION_ACCELERATION_RANGE);
        this.accelToMiddleOfOthers(others, MIDDLE_ACCELERATION_AMOUNT, MIDDLE_ACCELERATION_RANGE);

        let accelMag = Math.sqrt(Math.pow(this.accelX, 2) + Math.pow(this.accelY,2));
        if (accelMag > MAX_ACCEL)
        {
            this.accelX = this.accelX / accelMag * MAX_ACCEL;
            this.accelY = this.accelY / accelMag * MAX_ACCEL;
        }

        this.velocityX += this.accelX;
        this.velocityY += this.accelY;

        let velocityMag = Math.sqrt(Math.pow(this.velocityX, 2) + Math.pow(this.velocityY,2));
        if (velocityMag != 0)
        {
            this.velocityX = this.velocityX / velocityMag * BOID_SPEED;
            this.velocityY = this.velocityY / velocityMag * BOID_SPEED;
        }

        if (this.velocityX != 0)
        {
            this.rotation = Math.atan2(this.velocityY, this.velocityX) - Math.PI / 2;
        }

        this.move(this.velocityX, this.velocityY);
    }

    move(x, y) {
        this.positionX += x;
        if (this.positionX > WRAP_BORDER)
        {
            this.positionX = -WRAP_BORDER + this.positionX % WRAP_BORDER;
        } else if (this.positionX < -WRAP_BORDER) {
            this.positionX = WRAP_BORDER + this.positionX % WRAP_BORDER;
        }

        this.positionY += y;
        if (this.positionY > WRAP_BORDER)
        {
            this.positionY = -WRAP_BORDER + this.positionY % WRAP_BORDER;
        } else if (this.positionY < -WRAP_BORDER) {
            this.positionY = WRAP_BORDER + this.positionY % WRAP_BORDER;
        }
    }

    accelAwayFromOthers(others, amount, range)
    {
        for (let boid of others)
        {
            let toMoveX = this.positionX - boid.positionX;
            let toMoveY = this.positionY - boid.positionY;
            let distance = Math.sqrt(Math.pow(toMoveX, 2) + Math.pow(toMoveY, 2));
            //console.log(`X: ${toMoveX}, y: ${toMoveY}, distance: ${distance}`);
            if(distance < range)
            {
                if (distance > 0)
                {
                    this.accelX += toMoveX * amount * (1/Math.sqrt(distance));
                    this.accelY += toMoveY * amount * (1/Math.sqrt(distance));
                }
                
            }
        }
    }

    accelInSameDirectionAsOthers(others, amount, range)
    {
        let toCalc = [];
        for (let boid of others)
        {
            let distance = this.getDistanceTo(boid);

            if (distance < range && distance != 0)
            {
                toCalc.push([boid, distance]);
            }
        }

        let sumX = 0;
        let sumY = 0;
        for (let [boid, distance] of toCalc)
        {
            
            sumX += boid.velocityX / distance;
            sumY += boid.velocityY / distance;
        }

        let avgX = 0;
        let avgY = 0;
        if (toCalc.length != 0)
        {
            avgX = sumX / toCalc.length;
            avgY = sumY / toCalc.length;
        }

        let avgMag = Math.sqrt(Math.pow(avgX, 2) + Math.pow(avgY,2));
        
        if (avgMag != 0)
        {
            this.accelX += avgX / avgMag * amount;
            this.accelY += avgY / avgMag * amount;
        }
    }

    accelToMiddleOfOthers(others, amount, range)
    {
        let toCalc = [];
        for (let boid of others)
        {
            let distance = this.getDistanceTo(boid);

            if (distance < range && distance != 0)
            {
                toCalc.push(boid);
            }
        }

        let sumX = 0;
        let sumY = 0;
        for (let boid of toCalc)
        {
            
            sumX += boid.positionX;
            sumY += boid.positionY;
        }

        let avgX = 0;
        let avgY = 0;
        if (toCalc.length != 0)
        {
            avgX = sumX / toCalc.length;
            avgY = sumY / toCalc.length;
        }

        

        let toMoveX = avgX - this.positionX;
        let toMoveY = avgY - this.positionY;

        let toMoveMag = Math.sqrt(Math.pow(toMoveX, 2) + Math.pow(toMoveY,2));

        this.accelX += toMoveX / toMoveMag * amount;
        this.accelY += toMoveY / toMoveMag * amount;
    }

    getDistanceTo(boid)
    {
        let toMoveX = this.positionX - boid.positionX;
        let toMoveY = this.positionY - boid.positionY;
        return Math.sqrt(Math.pow(toMoveX, 2) + Math.pow(toMoveY, 2));
    }
}