import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: "Method Not Allowed"
      };
    }

    const body = JSON.parse(event.body);

    /* -------------------------
       Insert Parent
    -------------------------- */
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

    if (parentError) {
      console.error(parentError);
      throw new Error("Failed to insert parent");
    }

    /* -------------------------
       Insert Children
    -------------------------- */
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

    if (childrenError) {
      console.error(childrenError);
      throw new Error("Failed to insert children");
    }

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
}
