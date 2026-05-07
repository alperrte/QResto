import { Link } from "react-router-dom";
import MaterialIcon from "../../../components/ui/MaterialIcon";
import { type MenuItem } from "../menuItems";

type MenuItemCardProps = {
    item: MenuItem;
    animationDelay: string;
    animationClassName: string;
};

const MenuItemCard = ({
    item,
    animationDelay,
    animationClassName,
}: MenuItemCardProps) => {
    return (
        <Link
            to={`/menu/${item.id}`}
            style={{ animationDelay }}
            className={`${animationClassName} bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(30,27,24,0.05)] border border-outline-variant/20 flex flex-col text-left hover:shadow-[0_8px_28px_rgba(30,27,24,0.08)] transition-shadow`}
        >
            <div className="h-48 w-full bg-surface-container">
                <img
                    alt=""
                    src={item.imageUrl}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-headline text-[20px] leading-tight text-on-surface">
                        {item.name}
                    </h3>
                    <span className="font-sans text-price-tag text-secondary shrink-0 font-bold">
                        {item.priceLabel}
                    </span>
                </div>
                <p className="font-sans text-body-sm text-on-surface-variant/80 line-clamp-2 mb-4 flex-1">
                    {item.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-on-surface-variant/70 font-sans text-[12px]">
                        <div className="flex items-center gap-1">
                            <MaterialIcon
                                name="schedule"
                                className="text-[16px]"
                            />
                            <span>{item.prepMinutes} dk</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MaterialIcon
                                name="local_fire_department"
                                className="text-[16px]"
                            />
                            <span>{item.kcal} kcal</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                            <MaterialIcon
                                name="star"
                                fill
                                className="text-[16px]"
                            />
                            <span className="font-bold">{item.rating}</span>
                        </div>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
                        <MaterialIcon
                            name="add"
                            className="text-[20px]"
                        />
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default MenuItemCard;
