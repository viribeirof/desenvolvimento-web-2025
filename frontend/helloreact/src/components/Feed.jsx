const posts = [
    { id: 1, autor: "Ana", texto: "Primeiro post!" },
    { id: 2, autor: "Leo", texto: "React é top!" },
];
const Post = ({ autor, texto }) => {
    return (
        <article>
            <strong>{autor}</strong>
            <p>{texto}</p>
        </article>
    )
}
const Feed = () => {
    return posts.map(post => <Post key={post.id} {...post} />);
}
export default Feed
