export type ObjectId = string;

export type Pet = {
    _id: ObjectId;
    user_id: ObjectId;
    name: string;
    species: "dog" | "cat" | "rabbit" | "bird" | "other";
    breed: string;
    birth_date: string;
    sex: "male" | "female";
    image_url: string;
    create_date: string;
};
