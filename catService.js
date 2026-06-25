import { getBreedById } from './breedsService.js';
import cats from './cats.js';

export function getCatById(catId) {
    return cats.find(cat => cat.id === catId);
}

export function getCatId(req) {
    return req.url.split('/').pop();
}

export function editCat(catId, catData) {
    const catIndex = cats.findIndex(cat => cat.id === catId);

    cats[catIndex] = {
        id: catId,
        ...catData,
        breed: getBreedById(catData.breed)
    };
}

export function deleteCat(catId) {
    const catIndex = cats.findIndex(cat => cat.id === catId);

    cats.splice(catIndex, 1);
}