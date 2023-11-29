export default function rectangularCollision({ rectangle1, rectangle2 }) {
    return(
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height / 15 &&
        rectangle1.position.y + rectangle1.height * 1.3 >= rectangle2.position.y
    );
}