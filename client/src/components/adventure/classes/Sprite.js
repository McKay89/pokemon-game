class Sprite {
    constructor({ position, velocity, image, frames = { max: 1 }, sprites, object = { height: 1, width: 1 }, type = "object", animation = { speed: 1 } }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}
        this.object = object
        this.type = type

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false
        this.sprites = sprites
        this.animation = animation
    }

    draw(c) {
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.object.width,
            this.image.height * this.object.height
        )

        if(this.moving && this.type == "player" || this.type == "object") {
            if(this.frames.max > 1) {
                this.frames.elapsed++
            }
    
            if(this.frames.elapsed % this.animation.speed === 0) {
                if(this.frames.val < this.frames.max - 1) this.frames.val++
                else this.frames.val = 0    
            }
        } else {
            this.frames.val = 0
        }
    }
}

export default Sprite;