class Boundary {
    static width = 64;
    static height = 64;

    constructor({ position }) {
        this.position = position;
        this.width = 64;
        this.height = 64;
    }

    draw(c) {
        c.fillStyle = "rgba(255, 0, 0, 0.0)";
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

export default Boundary;