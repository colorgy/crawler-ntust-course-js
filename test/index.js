import test from "tape"
import crawlerNTUSTCourse from "../"

test("crawlerNtustCourse", (t) => {
  t.plan(1)
  t.equal(true, crawlerNTUSTCourse(), "return true")
})
