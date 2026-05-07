type MenuCategoryHeadingProps = {
    title: string;
    animationDelayMs: number;
};

const MenuCategoryHeading = ({ title, animationDelayMs }: MenuCategoryHeadingProps) => {
    return (
        <div
            style={{ animationDelay: `${animationDelayMs}ms` }}
            className="menu-heading-stagger flex justify-between items-end gap-4"
        >
            <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
        </div>
    );
};

export default MenuCategoryHeading;
