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
    };
}