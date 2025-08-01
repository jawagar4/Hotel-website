import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res)=> {
    try{
        //Create a Svix 
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        //Getting
        const headers = {
            "svix-id": req.headers["svix-id"],
             "svix-timestamp": req.headers["svix-timestamp"],
              "svix-signature": req.headers["svix-signature"],

        };

        //verifying Header
        await whook.verify(JSON.stringify(req.body), headers)

        //Getting DAta from request
        const{data, type} = req.body

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: data.first_name+""+ data.last_name,
            image: data.image_url
        }

        //Switch Cases
        switch (type) {
            case "user.created":{
                await User.create(userData);
                break;
            }

            case "user.update":{
                await User.findByIdAndUpdate(data.id, userData);
                break;
            }

            case "user.deleted":{
                await User.findByIdAndDelete(data.id);
                break;
            }
                
        
            default:
                break;
        }
        res.json({success: true, message: "webhook Recieved"})
    }catch (error){
console.log(error.message);
res.json({success: false, message: error.message});
    }
}

export default clerkWebhooks;
