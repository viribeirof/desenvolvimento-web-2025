const Perfil = () => {
    const nome = "Vitória Ribeiro";
    const imgUrl = "https://www.freeiconspng.com/uploads/profile-icon-9.png";
    const descricao = "Desenvolvedora. Apaixonada por React";
    return (
        <div>
            <h1>{nome}</h1>
            <img src={imgUrl} width={100} alt="Foto de perfil" />
            <p>{descricao}</p>
        </div>
    )
}
export default Perfil
