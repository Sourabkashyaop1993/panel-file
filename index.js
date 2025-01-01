console.log("hello world");
let os = require("os");
let express = require("express");
let app = express();

let mongoose = require("mongoose");
let fileUpload = require("express-fileupload");
const e = require("express");
const { trace } = require("console");

app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(fileUpload());

app.use(express.json());
app.use(express.static("./assets"));

// (mongoDB me data lane ke liye)

mongoose
  .connect("mongodb://localhost:27017/form_19")
  .then(() => {
    console.log("mongoDB connect");
  })
  .catch(error => {
    console.log(error);
  });

let formSchema = mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String
    },
    mobile: {
      type: Number
    },
    subject: {
      type: String
    },
    message: {
      type: String
    },
    status: {
      type: String
    }
  }
  // {
  //     timeStamps: true
  // }
);

let formModel = new mongoose.model("form22", formSchema);

app.post("/create", async (req, res) => {
  let { name, email, mobile, subject, message, status } = req.body;

  let err = [];
  if (!name) {
    err.push("please Provide Name");
  }
  if (!email) {
    err.push("please Provide Email");
  }
  if (!mobile) {
    err.push("please Provide Mobile");
  }
  if (!subject) {
    err.push("please Provide subject");
  }
  if (!message) {
    err.push("please Provide Message");
  }
  // if(!status){
  //     err.push("please Provide Status")
  // }

  console.log(err);

  if (email) {
    let duplicateform = await formModel.findOne({ email });
    if (duplicateform) {
      err.push(`Email Already Exist to ${duplicateform.name}`);
    }
  }

  if (mobile.length == 10) {
    let duplicateform = await formModel.findOne({ mobile });
    if (duplicateform) {
      err.push(`Mobile Already Exist to ${duplicateform.name}`);
    }
  } else {
    err.push("Enter valid Mobile Number");
  }

  console.log(err);

  if (err.length) {
    res.json({
      created: false,
      message: {
        icon: "error",
        title: "Oops...",
        html: err.join("<br/>")
      }
    });
  } else {
    let data = await new formModel({
      name,
      email,
      mobile,
      subject,
      message,
      status
    });
    await data.save();

    if (data) {
      res.json({
        status: true,
        message: {
          title: "Good job!",
          text: "Forms Created Successfully!",
          icon: "success"
        },

        tr: ` <tr>
                            <th scope="row">1</th>
                            <td>${data.name}</td>
                            <td>${data.email}</td>
                            <td>${data.mobile}</td>
                            <td>${data.subject}</td>
                            <td>${data.message}</td>
                            <td>${data.status}</td>
                            <td><button class="edit-enq"  data-bs-toggle="modal" data-bs-target="#exampleModal"  ><i class="fa-solid fa-pencil  "></i></button><button
                                    class="delete-enq ms-4 "><i class="fa-solid fa-trash"
                                        style="color: white;"></i></button></td>


                        </tr>`

      });
    }
  }
});

app.get("/panel", async (req, res) => {
    try {
       let allforms = await formModel.find().sort({createAt: -1})
       res.render("panel",{allforms});
    } catch (error) {
        console.log(error)
    }

});

// read form Route

app.get("/read/form", async (req, res)=>{
    let {id} = req.query
    // console.log(id)

    try {
        let readForm = await formModel.findOne({_id: id})
        if(readForm){
            res.json({
                read: true,
                readForm,
                formUrl: "update/form?id="+ id
            });
        }else{
            res.json({message: "send"})
        }
    }
     catch (error) { }
       
})


app.post("/update/form", async (req, res) => {
  let { id } = req.query;
  let { name, email, subject, message, mobile, status } = req.body;

  try {
    let err = [];

    if (!name) {
      err.push("Please Provide Name");
    }

    if (!email) {
      err.push("Please Provide Email");
    }

    if (!subject) {
      err.push("Please Provide Subject");
    }

    if (!message) {
      err.push("Please Provide Message");
    }

    if (email) {
      let duplicateForm = await formModel.findOne({ _id: { $ne: id }, email });
      if (duplicateForm) {
        err.push(`Email Already Exist to ${duplicateForm.name}`);
      }
    }

    if (mobile.length == 10) {
      let duplicateForm = await formModel.findOne({ _id: { $ne: id }, mobile });
      if (duplicateForm) {
        err.push(`Mobile Already Exist to ${duplicateForm.name}`);
        // err.push("Email Already Exist")
      }
    } else {
      err.push("Enter Valid Mobile Number");
    }

    if (err.length) {
      res.status(400).json({
        updated: false,
        message: {
          icon: "error",
          title: "Oops...",
          html: err.join("<br/>")
        }
      });
    } else {
      let updateForm = await formModel.findOneAndUpdate(
        { _id: id },
        { name, email, subject, mobile, message, status },
        { new: true }
      );

      if (updateForm) {
        res.json({
          updated: true,
          updateForm,
          message: {
            title: "Good job!",
            text: "Lead Updated Successfully!",
            icon: "success",
            timer: "1500"
          },

          // form ko  without refresh update karne ke liye

          td: ` <td>${updateForm.name}</td>
                          <td>${updateForm.email}</td>
                          
                          <td>${updateForm.mobile}</td>
                          <td>${updateForm.subject}</td>
                          <td>${updateForm.message}</td>
                          <td>${updateForm.status}</td>
                          <td><button class="edit-enq" id="edit-lead" data-url="/read/lead?id=<%= lead.id %>"   data-bs-toggle="modal" data-bs-target="#exampleModal"  ><i class="fa-solid fa-pencil  "></i></button><button
                                  class="delete-enq ms-4 "><i class="fa-solid fa-trash"
                                      style="color: white;"></i></button></td>`,

          trId: "#form-" + id
        });
      }
    }
  } catch (error) {
    console.log(error);
    
    res.json({message:"Hello"})
  }
});



app.get("/delete/form", async (req, res)=>{
  let {id} = req.query
  try {
    let deleteForm = await formModel.deleteOne({_id: id})
if(deleteForm.deletedCount){
  res.json({
    deleted: true,
    trId: "#form-" + id
  })
}

 
    
  } catch (error) {
    
  }
})



app.listen(4500, () => {
  console.log("server is start 4500");
});
