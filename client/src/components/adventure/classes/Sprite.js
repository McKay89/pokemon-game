class Sprite {
    constructor({ position, velocity, image, frames = { max: 1 }, sprites, player = { height: 1, width: 1 } }) {
        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}
        this.player = player

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.moving = false
        this.sprites = sprites
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
            this.image.width / this.player.width,
            this.image.height * this.player.height
        )

        if(this.moving) {
            if(this.frames.max > 1) {
                this.frames.elapsed++
            }
    
            if(this.frames.elapsed % 8 === 0) {
                if(this.frames.val < this.frames.max - 1) this.frames.val++
                else this.frames.val = 0
            }
        } else {
            this.frames.val = 0
        }
    }
}

export default Sprite;