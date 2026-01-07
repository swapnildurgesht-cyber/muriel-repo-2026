const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const body = JSON.parse(event.body);

    const { data: parent, error: parentError } = await supabase
      .from("parents")
      .insert({
        parentname: body.parentName,
        mobile: body.mobile,
        wing: body.wing,
        flat_no: body.flat
      })
      .select("parentid")
      .single();

    if (parentError) throw parentError;

    const childrenRows = body.children.map((c, index) => ({
      parentid: parent.parentid,
      child_no: index + 1,
      childname: c.name,
      age: c.age,
      events: c.events
    }));

    const { error: childrenError } = await supabase
      .from("children")
      .insert(childrenRows);

    if (childrenError) throw childrenError;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
