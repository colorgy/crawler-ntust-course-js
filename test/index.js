import test from "tape"
import crawlerNtustCourse from "../"

test("crawlerNtustCourse", (t) => {
  t.plan(1)
  t.equal(true, crawlerNtustCourse(), "return true")
})
