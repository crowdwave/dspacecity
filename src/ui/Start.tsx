import {ListData, ListIdentifier, ListMetaDataItem, SelectedItem} from "../listnavigator/listNavigatorTypes";
import React from "react";
import {VerticalNavigator} from "../listnavigator/VerticalNavigator";
import makeCommunitiesList from "../data/makeCommunitiesList";
import makeCollectionsList from "../data/makeCollectionsList";
import {setListItemCount} from "../listnavigator/ListItemCount";


const onListDisplayedCallback = async (selectedList: ListData) => {
    switch (selectedList.listIdentifier) {
        case 'rootlist':
            setListItemCount(null);
            break;
        case 'communities':
            setListItemCount(selectedList.listMetaDataItem.length);
            break;
        case 'collections':
            setListItemCount(selectedList.listMetaDataItem.length);
            break;
        default:
            break;
    }
}

const onRowSelectCallback = async (selectedRow: SelectedItem, selectedList: ListData) => {
    console.log('selectedRow: ', selectedRow)

    // do something with the selected row
    console.log(Object.keys(selectedRow.listMetaDataItem))
}

const getListForRoot = (): ListMetaDataItem[] => {
    //return selectedRow.listMetaDataItem.id === 'root'
    return [
        {id: 'communities', name: 'Communities'},
        {id: 'collections', name: 'Collections'},
        {id: 'items', name: 'Items'},
        {id: 'authors', name: 'Authors'},
    ]
}

const getListForCommunities = async (): Promise<ListMetaDataItem[]> => {
    try {
        return await makeCommunitiesList();
    } catch (error: unknown) {
        console.error("Error fetching communities:", error);
        return []
    }
};

const getListForCollections = async (): Promise<ListMetaDataItem[]> => {
    try {
        return await makeCollectionsList();
    } catch (error: unknown) {
        console.error("Error fetching collections:", error);
        return []
    }
};


const onGetNextListCallback = async (selectedRow: SelectedItem | null): Promise<[ListMetaDataItem[], ListIdentifier]> => {
    try {
        console.log('selectedRow: ', selectedRow)
        // null means startup/initialise so we pass in the root list
        if (selectedRow === null) {
            const listIdentifier: ListIdentifier = 'rootlist'
            return [getListForRoot(), listIdentifier]
        }
        if (selectedRow.listMetaDataItem.id === 'communities') {
            const communities = await getListForCommunities()
            const listIdentifier: ListIdentifier = 'communities'
            return [communities, listIdentifier]
        }
        if (selectedRow.listMetaDataItem.id === 'collections') {
            const collections = await getListForCollections()
            const listIdentifier: ListIdentifier = 'collections'
            return [collections, listIdentifier]
        }
        // maybe selected row should be including information about which list it belongs to
    } catch (e) {
        alert('error getting next list')
    }
    // Return a default ListIdentifier value when there's an error or the selected row is not 'communities' or 'collections'
    return [[], 'default']
}

export const Start = () => {
    return (
        <VerticalNavigator
            onListDisplayedCallback={onListDisplayedCallback}
            onRowSelectCallback={onRowSelectCallback}
            onGetNextListCallback={onGetNextListCallback}
        />
    );
}
const getNextItemSetOfListData = (listMetaDataItem: ListMetaDataItem): ListMetaDataItem[] => {
    switch (listMetaDataItem.id) {
        case 'electronics':
            return [
                {id: 'laptops', name: 'Laptops'},
                {id: 'smartphones', name: 'Smartphones'},
                {id: 'tablets', name: 'Tablets'},
                {id: 'cameras', name: 'Cameras'},
                {id: 'accessories', name: 'Accessories'},
            ];
        case 'laptops':
            return [
                {id: 'gaming-laptop', name: 'Gaming Laptop'},
                {id: 'ultrabook', name: 'Ultrabook'},
                {id: '2-in-1', name: '2-in-1'},
                {id: 'business-laptop', name: 'Business Laptop'},
                {id: 'chromebook', name: 'Chromebook'},
            ];
        case 'smartphones':
            return [
                {id: 'flagship', name: 'Flagship'},
                {id: 'midrange', name: 'Midrange'},
                {id: 'budget', name: 'Budget'},
                {id: 'gaming-phone', name: 'Gaming Phone'},
                {id: 'foldable', name: 'Foldable'},
            ];
        case 'gaming-laptop':
            return [
                {id: 'alienware', name: 'Alienware'},
                {id: 'msi', name: 'MSI'},
                {id: 'asus-rog', name: 'Asus ROG'},
                {id: 'acer-predator', name: 'Acer Predator'},
                {id: 'razer-blade', name: 'Razer Blade'},
            ];
        case 'ultrabook':
            return [
                {id: 'macbook-air', name: 'MacBook Air'},
                {id: 'dell-xps', name: 'Dell XPS'},
                {id: 'hp-spectre', name: 'HP Spectre'},
                {id: 'lenovo-yoga', name: 'Lenovo Yoga'},
                {id: 'asus-zenbook', name: 'Asus ZenBook'},
            ];
        case 'flagship':
            return [
                {id: 'iphone', name: 'iPhone'},
                {id: 'samsung-galaxy', name: 'Samsung Galaxy'},
                {id: 'google-pixel', name: 'Google Pixel'},
                {id: 'oneplus', name: 'OnePlus'},
                {id: 'sony-xperia', name: 'Sony Xperia'},
            ];
        case 'iphone':
            return [
                {id: 'iphone-12', name: 'iPhone 12'},
                {id: 'iphone-12-pro', name: 'iPhone 12 Pro'},
                {id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max'},
                {id: 'iphone-12-mini', name: 'iPhone 12 Mini'},
                {id: 'iphone-11', name: 'iPhone 11'},
            ];
        case 'furniture':
            return [
                {id: 'living-room', name: 'Living Room'},
                {id: 'bedroom', name: 'Bedroom'},
                {id: 'office', name: 'Office'},
                {id: 'outdoor', name: 'Outdoor'},
                {id: 'kitchen', name: 'Kitchen'},
            ];
        case 'living-room':
            return [
                {id: 'sofa', name: 'Sofa'},
                {id: 'coffee-table', name: 'Coffee Table'},
                {id: 'tv-stand', name: 'TV Stand'},
                {id: 'bookshelf', name: 'Bookshelf'},
                {id: 'recliner', name: 'Recliner'},
            ];
        case 'bedroom':
            return [
                {id: 'bed', name: 'Bed'},
                {id: 'wardrobe', name: 'Wardrobe'},
                {id: 'nightstand', name: 'Nightstand'},
                {id: 'dresser', name: 'Dresser'},
                {id: 'mirror', name: 'Mirror'},
            ];
        case 'clothing':
            return [
                {id: 'men', name: 'Men'},
                {id: 'women', name: 'Women'},
                {id: 'kids', name: 'Kids'},
                {id: 'accessories', name: 'Accessories'},
                {id: 'shoes', name: 'Shoes'},
            ];
        case 'men':
            return [
                {id: 'shirts', name: 'Shirts'},
                {id: 'pants', name: 'Pants'},
                {id: 'jackets', name: 'Jackets'},
                {id: 'suits', name: 'Suits'},
                {id: 'shorts', name: 'Shorts'},
            ];
        case 'women':
            return [
                {id: 'dresses', name: 'Dresses'},
                {id: 'tops', name: 'Tops'},
                {id: 'skirts', name: 'Skirts'},
                {id: 'heels', name: 'Heels'},
                {id: 'handbags', name: 'Handbags'},
            ];
        case 'sports':
            return [
                {id: 'soccer', name: 'Soccer'},
                {id: 'basketball', name: 'Basketball'},
                {id: 'tennis', name: 'Tennis'},
                {id: 'golf', name: 'Golf'},
                {id: 'baseball', name: 'Baseball'},
            ];
        case 'soccer':
            return [
                {id: 'soccer-ball', name: 'Soccer Ball'},
                {id: 'soccer-cleats', name: 'Soccer Cleats'},
                {id: 'soccer-jersey', name: 'Soccer Jersey'},
                {id: 'soccer-goal', name: 'Soccer Goal'},
                {id: 'shin-guards', name: 'Shin Guards'},
            ];
        case 'basketball':
            return [
                {id: 'basketball-ball', name: 'Basketball'},
                {id: 'basketball-shoes', name: 'Basketball Shoes'},
                {id: 'basketball-jersey', name: 'Basketball Jersey'},
                {id: 'basketball-hoop', name: 'Basketball Hoop'},
                {id: 'basketball-net', name: 'Basketball Net'},
            ];
        case 'books':
            return [
                {id: 'fiction', name: 'Fiction'},
                {id: 'non-fiction', name: 'Non-Fiction'},
                {id: 'comics', name: 'Comics'},
                {id: 'children', name: 'Children'},
                {id: 'educational', name: 'Educational'},
            ];
        case 'fiction':
            return [
                {id: 'mystery', name: 'Mystery'},
                {id: 'romance', name: 'Romance'},
                {id: 'sci-fi', name: 'Science Fiction'},
                {id: 'fantasy', name: 'Fantasy'},
                {id: 'thriller', name: 'Thriller'},
            ];
        case 'non-fiction':
            return [
                {id: 'biography', name: 'Biography'},
                {id: 'self-help', name: 'Self-Help'},
                {id: 'cookbooks', name: 'Cookbooks'},
                {id: 'history', name: 'History'},
                {id: 'travel', name: 'Travel'},
            ];
        default:
            return [];
    }
};