type MenuDetailHeroProps = {
    name: string;
    imageUrl: string;
};

const MenuDetailHero = ({ name, imageUrl }: MenuDetailHeroProps) => {
    return (
        <div className="menu-detail-hero relative bg-surface-variant overflow-hidden md:max-w-3xl md:mx-auto md:mt-6 md:rounded-3xl menu-detail-fade-up">
            <img
                alt={name}
                src={imageUrl}
                className="w-full h-full object-cover object-center absolute inset-0"
            />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
        </div>
    );
};

export default MenuDetailHero;
